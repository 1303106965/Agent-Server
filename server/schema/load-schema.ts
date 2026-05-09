import sql from "mssql";

import path from "path";

import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "server/data/.env"
  )
});

/**
 * SQLServer配置
 */
const config = {
  server: "sqlserver",
  port: 1433,
  database: "sample",
  user: "sa",
  password:process.env.SQLSERVER_PASSWORD,
  options: {trustServerCertificate: true}
};

/**
 * 加载数据库schema
 */
export async function loadSchema() {

  await sql.connect(config);

  /**
   * 查询所有表字段
   */
  const result =
    await sql.query(`
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
ORDER BY TABLE_NAME
`);

  await sql.close();

  /**
   * 转换结构
   */
  const schema:
    Record<string, any[]> = {};

  for (
    const row
    of result.recordset
  ) {

    const table =
      row.TABLE_NAME;

    if (!schema[table]) {

      schema[table] = [];
    }

    schema[table].push({

      name:
        row.COLUMN_NAME,

      type:
        row.DATA_TYPE
    });
  }

  return schema;
}