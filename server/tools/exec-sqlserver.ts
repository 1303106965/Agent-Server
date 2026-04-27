#!/usr/bin/env tsx
import dotenv from 'dotenv';
dotenv.config({ path: '/home/node/.openclaw/workspace/data/.env' });
import { Command } from 'commander';
import sql from 'mssql';

// --- 配置 ---
const config = {
  server: 'sqlserver',
  port: 1433,
  database: 'sample',
  user: 'sa',
  password: process.env.SQLSERVER_PASSWORD || '',
  options: {
    trustServerCertificate: true,
  },
};

// --- 命令行接口（CLI）---
const program = new Command();
program.name('exec-sqlserver').description('安全执行 T-SQL 语句（针对本地 SQL Server）');

program
  .option('-s, --sql <sql>', '待执行的 T-SQL 语句', '')
  .option('--confirm', '执行前请求确认', false)
  .option('--yes', '跳过确认，立即执行', false)
  .option('--dry-run', '仅打印 SQL，不执行', true);

program.parse();

const opts = program.opts();

if (!opts.sql?.trim()) {
  console.error('❌ 错误：--sql 参数为必需');
  console.log('用法：npx tsx tools/exec-sqlserver.ts --sql "SELECT 1" [--confirm | --yes]');
  process.exit(1);
}

console.log('🔍 即将执行：');
console.log(`   ${opts.sql}`);
console.log(`   → 服务器: ${config.server}:${config.port}, 数据库: ${config.database}`);

if (opts.dryRun && !opts.confirm && !opts.yes) {
  console.log('💡 提示：添加 --confirm 可预览并确认，或添加 --yes 直接执行。');
  process.exit(0);
}

// 确认执行？
if (opts.confirm && !opts.yes) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\n⚠️  确认执行此 SQL？(y/N): ', (answer) => {
    rl.close();
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('👋 已取消。');
      process.exit(0);
    }
    runSql(opts.sql);
  });
} else {
  runSql(opts.sql);
}

async function runSql(sqlQuery) {
  if (!config.password) {
    console.error('❌ 未设置 SQLSERVER_PASSWORD 环境变量！');
    console.log('👉 请运行：export SQLSERVER_PASSWORD="你的 sa 密码"');
    process.exit(1);
  }

  try {
    await sql.connect(config);
    const result = await sql.query(sqlQuery);
    console.log(`✅ 执行成功！`);
    if (result.recordset && result.recordset.length > 0) {
      console.log(`   → 返回 ${result.recordset.length} 行数据`);
      // 打印前 3 行作为预览
      for (let i = 0; i < Math.min(3, result.recordset.length); i++) {
        console.log(`     ${JSON.stringify(result.recordset[i])}`);
      }
      if (result.recordset.length > 3) console.log('     ... （已截断）');
    } else if (result.rowsAffected && result.rowsAffected > 0) {
      console.log(`   → 影响 ${result.rowsAffected} 行`);
    }
  } catch (err) {
    console.error(`❌ 执行失败: ${err.message}`);
    if (err.lineNumber) {
      console.error(`   第 ${err.lineNumber} 行，第 ${err.columnNumber} 列`);
    }
  } finally {
    await sql.close();
  }
}