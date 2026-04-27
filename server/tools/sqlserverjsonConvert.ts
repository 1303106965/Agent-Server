import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

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
    default: throw new Error(`Unsupported where type: ${type}`);
  }
}

// --- 配置（JSON）→ 可执行 SQL ---
export function toSql(config: ConfigRoot): string {
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

// --- SQL → 配置（JSON）（v1 解析器）---
export function toConfig(sql: string): ConfigRoot {
  // 提取 SELECT 字段：格式如 `SELECT a AS b, c AS d`
  const selectMatch = sql.match(/SELECT\s+([^]+?)\s+FROM/i);
  if (!selectMatch) throw new Error('Invalid SELECT syntax: missing FROM');

  const columnDefs = selectMatch[1].split(',').map(s => s.trim());
  const columns: Column[] = [];
  for (const def of columnDefs) {
    const asMatch = def.match(/^(.+)\s+AS\s+(.+)$/i);
    if (asMatch) {
      columns.push({
        expression: asMatch[1].trim(),
        alias: asMatch[2].trim(),
      });
    } else {
      // No AS → alias = expression
      const expr = def.trim();
      columns.push({ expression: expr, alias: expr });
    }
  }

  // 提取 FROM 表名
  const fromMatch = sql.match(/FROM\s+(\S+)/i);
  if (!fromMatch) throw new Error('Invalid SELECT syntax: missing FROM clause');

  // 提取 WHERE 条件（仅支持简单括号包裹形式）
  let whereCondition: WhereNode | undefined;
  const whereMatch = sql.match(/WHERE\s+\(([^)]+)\)/i);
  if (whereMatch) {
    const cond = whereMatch[1].trim();
    // Parse: `classNum >= 1105 AND classNum <= 1200`
    const andParts = cond.split(/\s+AND\s+/g).map(p => p.trim());
    if (andParts.length > 0) {
      const children: WhereLeaf[] = [];
      for (const part of andParts) {
        const geMatch = part.match(/^(\w+)\s*>=\s*(.+)$/);
        const leMatch = part.match(/^(\w+)\s*<=\s*(.+)$/);
        if (geMatch) {
          children.push({ key: geMatch[1], type: 'GE', value: geMatch[2].trim() });
        } else if (leMatch) {
          children.push({ key: leMatch[1], type: 'LE', value: leMatch[2].trim() });
        } else {
          throw new Error(`Unsupported WHERE fragment: ${part}`);
        }
      }
      whereCondition = {
        children: children as (WhereNode | WhereLeaf)[],
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
