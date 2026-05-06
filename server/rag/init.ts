import { getDb } from "../db/sqlite";

async function init() {

  const db = await getDb();

  /**
   * schema 向量表
   */
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_embeddings (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      table_name TEXT,

      column_name TEXT,

      description TEXT,

      embedding TEXT
    )
  `);

  console.log("✅ schema_embeddings 初始化完成");
}

init();