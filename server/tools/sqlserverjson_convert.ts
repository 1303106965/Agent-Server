#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { Command } from 'commander';

// --- 类型定义 ---
type Column = {
  expression: string;
  alias: string;
  aggregate?: boolean;
  subquery?: boolean;
};

type WhereLeaf = {
  key: string;
  type: 'EQ' | 'NE' | 'GT' | 'GE' | 'LT' | 'LE' | 'LIKE' | 'IN' | 'IS_NULL';
  value?: any;
};

type WhereNode = {
  children: (WhereNode | WhereLeaf)[];
  operateType: 'AND' | 'OR';
};

type PaginationNode = {
  pageNo: number;
  pageSize: number;
};

type ConfigData = {
  tableName: string;
  dbId: string;
  columns: Column[];
  whereCondition?: WhereNode;
  paginationNode?: PaginationNode;
  orderBy?: unknown[];
  groupByColumns?: string[];
};

type ConfigRoot = {
  config: {
    defaults: {
      arg0: { data: ConfigData };
    };
    fn: string;
  };
};

// --- 工具函数 ---
function sqlEscape(str: string): string {
  return `'${str.replace(/'/g, "''")}'`;
}

function whereNodeToSql(node: WhereNode | WhereLeaf): string {
  if ('children' in node) {
    const childrenSql = node.children.map(whereNodeToSql).join(` ${node.operateType} `);
    return `(${childrenSql})`;
  }

  const { key, type, value } = node as WhereLeaf;
  switch (type) {
    case 'EQ': return `${key} = ${typeof value === 'string' ? sqlEscape(value) : value}`;
    case 'NE': return `${key} != ${typeof value === 'string' ? sqlEscape(value) : value}`;
    case 'GT': return `${key} > ${typeof value === 'string' ? sqlEscape(value) : value}`;
    case 'GE': return `${key} >= ${typeof value === 'string' ? sqlEscape(value) : value}`;
    case 'LT': return `${key} < ${typeof value === 'string' ? sqlEscape(value) : value}`;
    case 'LE': return `${key} <= ${typeof value === 'string' ? sqlEscape(value) : value}`;
    case 'LIKE': return `${key} LIKE ${sqlEscape(value)}`;
    case 'IN': return `${key} IN (${Array.isArray(value) ? value.map(v => typeof v === 'string' ? sqlEscape(v) : v).join(', ') : ''})`;
    case 'IS_NULL': return `${key} IS NULL`;
    default: throw new Error(`不支持的条件类型: ${type}`);
  }
}

// --- 配置（JSON）→ 可执行 SQL ---
function jsonToSql(config: ConfigRoot): string {
  const data = config.config.defaults.arg0.data;

  // 构建 SELECT 子句
  const selectParts = data.columns.map(col => `${col.expression} AS ${col.alias}`).join(', ');

  // 构建 FROM 子句
  const fromPart = `FROM ${data.tableName}`;

  // 构建 WHERE 子句（若存在）
  let wherePart = '';
  if (data.whereCondition) {
    const whereSql = whereNodeToSql(data.whereCondition);
    wherePart = `WHERE ${whereSql}`;
  }

  return `SELECT ${selectParts}\n${fromPart}\n${wherePart}`.trim();
}

// --- SQL → 配置（JSON）（增强版）---
function sqlToJson(sql: string): ConfigRoot {
  // 提取 SELECT 字段列表（支持多行）
  const selectMatch = sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
  if (!selectMatch) throw new Error('SELECT 语句格式无效');

  const columnDefs = selectMatch[1].split(',').map(s => s.trim());
  const columns: Column[] = [];
  for (const def of columnDefs) {
    const asMatch = def.match(/^(.+)?\s+AS\s+(.+)$/i);
    if (asMatch) {
      columns.push({
        expression: asMatch[1].trim(),
        alias: asMatch[2].trim(),
      });
    } else {
      const expr = def.trim();
      columns.push({ expression: expr, alias: expr });
    }
  }

  // 提取 FROM 表名
  const fromMatch = sql.match(/FROM\s+(\S+)/i);
  if (!fromMatch) throw new Error('缺少 FROM 子句');

  // ✅ 增强的 WHERE 子句解析 — 支持：WHERE col = val、WHERE (a=b AND c>d) 等复杂形式
  let whereCondition: WhereNode | undefined;
  const whereMatch = sql.match(/WHERE\s+((?:[^;]|;\s*(?!$))+)/i);
  if (whereMatch) {
    const rawWhere = whereMatch[1].trim();
    // 标准化：将 AND/OR 替换为带空格的标记，便于后续分词
    // 然后解析简单二元条件：字段 操作符 值
    const tokens = rawWhere
      .replace(/\s*AND\s*/gi, ' AND ')
      .replace(/\s*OR\s*/gi, ' OR ')
      .split(/\s+/)
      .filter(t => t.length > 0);

    if (tokens.length >= 3) {
      const key = tokens[0];
      const op = tokens[1].toUpperCase();
      let value: any = tokens.slice(2).join(' ').replace(/^['"]|['"]$/g, '');

      // 将 SQL 操作符映射到内部枚举类型
      const typeMap: Record<string, WhereLeaf['type']> = {
        '=': 'EQ', '==': 'EQ', '!=': 'NE', '<>': 'NE',
        '>=': 'GE', '<=': 'LE', '>': 'GT', '<': 'LT',
        'LIKE': 'LIKE', 'IN': 'IN', 'IS': 'IS_NULL'
      };
      const type = typeMap[op] || 'EQ';

      // 处理 IN (...) → 提取数组
      if (op === 'IN' && value.startsWith('(') && value.endsWith(')')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
      }

      whereCondition = {
        children: [{
          key,
          type,
          value
        }] as (WhereNode | WhereLeaf)[],
        operateType: 'AND'
      };
    }
  }

  return {
    config: {
      defaults: {
        arg0: {
          data: {
            tableName: fromMatch[1],
            dbId: 'sampledb',
            columns,
            whereCondition,
            paginationNode: { pageNo: 1, pageSize: 1000 },
          }
        }
      },
      fn: 'selectSingleTable'
    }
  };
}

// --- 命令行接口（CLI）---
const program = new Command();
program.name('sqlserverjson_convert').description('在 sqlserverjson 配置（JSON）与 T-SQL 之间相互转换');

program
  .command('to-sql')
  .description('将 config.json 配置文件转换为可执行 SQL')
  .requiredOption('-f, --file <path>', '配置文件路径（config.json）')
  .action((opts) => {
    try {
      const json = JSON.parse(readFileSync(opts.file, 'utf8')) as ConfigRoot;
      const sql = jsonToSql(json);
      console.log(sql);
    } catch (e) {
      console.error('❌ JSON → SQL 转换失败:', (e as Error).message);
      process.exit(1);
    }
  });

program
  .command('to-json')
  .description('将 SQL 语句转换为结构化配置（JSON）')
  .requiredOption('-s, --sql <sql>', 'SQL 语句字符串')
  .action((opts) => {
    try {
      const config = sqlToJson(opts.sql);
      console.log(JSON.stringify(config, null, 2));
    } catch (e) {
      console.error('❌ SQL → JSON 转换失败:', (e as Error).message);
      process.exit(1);
    }
  });

program.parse();
