import { readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { toSql, toConfig } from './sqlserverjsonConvert';
// --- 工具函数：安全读取 JSON 文件 ---
function readJson<T>(path: string): T {
  try {
    const content = readFileSync(path, 'utf8');
    return JSON.parse(content) as T;
  } catch (e) {
    throw new Error(`读取 ${path} 失败: ${(e as Error).message}`);
  }
}

// --- 工具函数：写入文件并自动保存到历史目录 ---
async function writeWithHistory(content: string | Record<string, any>, prefix: string): Promise<string> {
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = '/home/node/.openclaw/workspace/sqlserverjson/history';
  try {
    const fs = await import('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = typeof content === 'string' ? '.sql' : '.json';
    const filename = `${dir}/${prefix}-${now}${ext}`;
    const toWrite = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(filename, toWrite);
    return filename;
  } catch (e) {
    console.warn('⚠️ 保存历史记录失败:', (e as Error).message);
    return '(历史保存失败)';
  }
}

// --- 主入口函数：根据自然语言指令分发转换任务 ---
export async function routeSqlserverjsonCommand(message: string): Promise<{ type: 'sql' | 'config', content: string, historyPath?: string }> {
  // 标准化输入：转小写并去除首尾空格
  const lower = message.toLowerCase().trim();

  // 情况 1：将配置（JSON）转换为可执行 SQL
  if (lower.includes('转成 sql') || lower.includes('to sql') || lower.includes('config → sql')) {
    // 提取配置文件路径：匹配引号内的 .json 文件名，或 SqlServerJson/ 开头的路径
    const configMatch = message.match(/(['"`])([^'"`]+?\.json)\1|SqlServerJson\/([^'"`\s\)]+)/i);
    let configPath = '';
    if (configMatch?.[2]) {
      configPath = configMatch[2];
    } else if (configMatch?.[3]) {
      configPath = `SqlServerJson/${configMatch[3]}`;
    } else {
      configPath = 'SqlServerJson/config.json'; // 默认路径
    }

    console.log(`🔍 检测到配置 → SQL 请求。正在加载: ${configPath}`);
    const config = readJson<any>(configPath);
    const sql = toSql(config);
    const history = writeWithHistory(sql, 'to-sql');
    
    // ✅ 自动保存 SQL 到 selSql/YYYYMMDD-HHMMSS-desc.md
    const descMatch = configPath.match(/\/([^\/]+)\.json$/i) || configPath.match(/([^\/]+)\.json$/i);
    const desc = descMatch ? descMatch[1] : 'unknown';
    const selSqlPath = `SqlServerJson/selSql/${desc}.md`;
    const fs = await import('fs');
    const now = new Date().toISOString();
    const mdContent = `\`\`\`sql\n${sql.replace(/;$/, '').trim()}\n\`\`\`\n\n> ✅ 生成于 ${now}\n> 🔧 基于 ${configPath}\n> 📌 可直接在 SSMS 或 Azure Data Studio 中执行`;
    try {
      if (!fs.existsSync('SqlServerJson/selSql')) {
        fs.mkdirSync('SqlServerJson/selSql', { recursive: true });
      }
      fs.writeFileSync(selSqlPath, mdContent);
      console.log(`✅ SQL 已自动保存至: ${selSqlPath}`);
    } catch (e) {
      console.warn('⚠️ 自动保存 selSql 失败:', (e as Error).message);
    }
    
    return { type: 'sql', content: sql, historyPath: history };
  }

  // 情况 2：将 SQL 语句转换为结构化配置（JSON）
  if (lower.includes('转成 config') || lower.includes('to json') || lower.includes('sql → config')) {
    // 提取 SQL 语句：支持冒号后内容、```sql 包裹块、单行反引号包裹，或整条以 SELECT 开头的消息
    let sql = '';
    const colonMatch = message.match(/[:：]\s*(.+)/i);
    if (colonMatch) {
      sql = colonMatch[1].trim();
    } else {
      const codeMatch = message.match(/```sql\n([\s\S]*?)```/i) || message.match(/`([^`]+)`/);
      if (codeMatch) {
        sql = codeMatch[1].trim();
      } else {
        // 回退方案：若消息以 SELECT 开头，则整条作为 SQL
        if (message.trim().toUpperCase().startsWith('SELECT')) {
          sql = message.trim();
        }
      }
    }

    if (!sql) throw new Error('未在消息中找到 SQL 语句。请用 ```sql ... ``` 包裹，或使用冒号语法。');

    console.log(`🔍 检测到 SQL → 配置请求。正在解析 SQL: ${sql.substring(0, 60)}...`);
    const config = toConfig(sql);
    const history = writeWithHistory(config, 'to-config');
    return { type: 'config', content: JSON.stringify(config, null, 2), historyPath: history };
  }

  // 情况 3：执行 SQL（调用 exec-sqlserver.ts）
  if (lower.includes('执行 sql') || lower.includes('run sql') || lower.includes('exec')) {
    // 提取 SQL：支持冒号后、```sql```、反引号、或整条 SELECT
    let sql = '';
    const colonMatch = message.match(/[:：]\s*(.+)/i);
    if (colonMatch) {
      sql = colonMatch[1].trim();
    } else {
      const codeMatch = message.match(/```sql\n([\s\S]*?)```/i) || message.match(/`([^`]+)`/);
      if (codeMatch) {
        sql = codeMatch[1].trim();
      } else {
        if (message.trim().toUpperCase().startsWith('SELECT')) {
          sql = message.trim();
        }
      }
    }

    if (!sql) throw new Error('未在消息中找到 SQL 语句。请用 ```sql ... ``` 包裹，或使用冒号语法。');

    console.log(`🚀 检测到执行 SQL 请求。即将运行：\n   ${sql}`);
    // 直接调用 exec-sqlserver.ts（通过 spawn 或 exec）
    // 注意：此 router 不直接执行，而是返回指令供 CLI 调用
    return { type: 'exec', content: sql };
  }

  // 情况 4：生成 CSV（调用 run-and-csv.ts）
  if (lower.includes('生成 csv') || lower.includes('run-and-csv') || lower.includes('save as csv')) {
    // 提取 SQL：同上
    let sql = '';
    const colonMatch = message.match(/[:：]\s*(.+)/i);
    if (colonMatch) {
      sql = colonMatch[1].trim();
    } else {
      const codeMatch = message.match(/```sql\n([\s\S]*?)```/i) || message.match(/`([^`]+)`/);
      if (codeMatch) {
        sql = codeMatch[1].trim();
      } else {
        if (message.trim().toUpperCase().startsWith('SELECT')) {
          sql = message.trim();
        }
      }
    }

    if (!sql) throw new Error('未在消息中找到 SQL 语句。请用 ```sql ... ``` 包裹，或使用冒号语法。');

    console.log(`📊 检测到生成 CSV 请求。即将运行：\n   ${sql}`);
    return { type: 'csv', content: sql };
  }

  throw new Error('无法识别的指令。示例用法："把 SqlServerJson/config.json 转成 SQL" 或 "把这个 SQL 转成 config：SELECT ..."');
}


