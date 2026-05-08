import Database from "better-sqlite3";

import path from "path";

import { loadSchema } from "../schema/load-schema";

import { getEmbedding } from "./embedding";

/**
 * SQLite数据库
 */
const db = new Database(path.resolve(process.cwd(), "server/data/data.db"));

/**
 * 初始化表
 */
db.exec(`

CREATE TABLE IF NOT EXISTS schema_embeddings (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  table_name TEXT,

  column_name TEXT,

  data_type TEXT,

  content TEXT,

  embedding TEXT
)

`);

/**
 * 构建schema向量索引
 */
async function main() {
  console.log("🚀 开始构建 Schema 向量库...");

  /**
   * 读取 schema
   */
  const schema = await loadSchema();

  /**
   * 清空旧数据
   */
  db.prepare(`DELETE FROM schema_embeddings`).run();

  /**
   * 插入语句
   */
  const insertStmt = db.prepare(`
  INSERT INTO schema_embeddings (
    table_name,
    column_name,
    data_type,
    content,
    embedding
  ) VALUES (?, ?, ?, ?, ?)
`);

  /**
   * 遍历所有表
   */
  for (const tableName in schema) {
    const columns = schema[tableName];

    for (const column of columns) {
      /**
       * embedding文本
       */
      const content = `
        表:
        ${tableName}
        字段:
        ${column.name}
        类型:
        ${column.type}
        `;
      console.log("\n📦 embedding:");

      console.log(content);

      /**
       * 生成 embedding
       */
      const embedding = await getEmbedding(content);

      /**
       * 写入 SQLite
       */
      insertStmt.run(
        tableName,

        column.name,

        column.type,

        content,

        JSON.stringify(embedding)
      );

      console.log("✅ 已写入:", tableName, column.name);
    }
  }

  console.log("\n🎉 Schema向量库构建完成");
}

main();
