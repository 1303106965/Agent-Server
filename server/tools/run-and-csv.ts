#!/usr/bin/env tsx
import sql from 'mssql';
import * as dotenv from 'dotenv';
import { Command } from 'commander';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import path from 'path';
import { readFileSync } from 'fs';

dotenv.config({
  path: path.resolve(__dirname, '../data/.env')
});
const config = {
  server: '43.156.73.183',
  port: 1433,
  database: 'sample',
  user: 'sa',
  password: process.env.SQLSERVER_PASSWORD || '',
  options: { trustServerCertificate: true },
};

// --- CLI ---
const program = new Command();
program.name('run-and-csv').description('Execute SQL and save result as CSV');

program
  .option('-s, --sql <sql>', 'T-SQL to execute', '')
  .option('--output <path>', 'Output CSV file path (optional)', '')
  .option(
    '--file <path>',
    'SQL file path'
  );

program.parse();

const opts = program.opts();

let finalSql = opts.sql;

/**
 * 如果传入了 --file
 * 则读取 SQL 文件
 */
if (opts.file) {
  finalSql = readFileSync(
    opts.file,
    'utf-8'
  );
}

/**
 * 防止 SQL 为空
 */
if (!finalSql?.trim()) {
  console.error('❌ Error: SQL is required');

  console.log(`
    支持两种方式：

    1. 直接传 SQL:
    npx tsx run-and-csv.ts --sql "SELECT * FROM students"

    2. 传 SQL 文件:
    npx tsx run-and-csv.ts --file ./temp.sql
    `);

  process.exit(1);
}

async function main() {
  if (!config.password) {
    console.error('❌ SQLSERVER_PASSWORD environment variable is not set!');
    console.log('👉 Please run: export SQLSERVER_PASSWORD="your_sa_password"');
    process.exit(1);
  }

  try {
    await sql.connect(config);
    const result = await sql.query(opts.sql);
    console.log('data:', JSON.stringify(result.recordset));
    if (!result.recordset || result.recordset.length === 0) {
      console.log('No data returned.');
      return;
    }

    // Generate CSV
    const rows = result.recordset;
    const keys = Object.keys(rows[0]);

    // Header
    let csv = keys.map(k => `"${k}"`).join(',');

    // Rows
    for (const row of rows) {
      const values = keys.map(key => {
        const val = row[key];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      });
      csv += '\n' + values.join(',');
    }

    // Output path
    let outputPath = opts.output;
    if (!outputPath) {
      const now = new Date().toISOString().replace(/[:.]/g, '-');
      outputPath = `SqlServerJson/selData/${now}-query-result.csv`;
      // Ensure dir exists
      const dir = dirname(outputPath);
      if (!require('fs').existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
      }
    }

    writeFileSync(outputPath, csv);
    console.log(`✅ CSV saved to: ${outputPath}`);
    console.log(`   → ${rows.length} rows written`);
  } catch (err: any) {
    console.error(`❌ Execution failed: ${err.message}`);
    if (err.lineNumber) {
      console.error(`   at line ${err.lineNumber}, column ${err.columnNumber}`);
    }
  } finally {
    await sql.close();
  }
}

main();