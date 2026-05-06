import { getDb } from "../db/sqlite";
import { getEmbedding } from "./embedding";

/**
 * 你的数据库 schema
 */
const schemas = [

  {
    table: "students",

    column: "name",

    description: "学生姓名"
  },

  {
    table: "students",

    column: "gender",

    description: "学生性别"
  },

  {
    table: "students",

    column: "age",

    description: "学生年龄"
  },

  {
    table: "students",

    column: "class_name",

    description: "学生班级"
  },

  {
    table: "students",

    column: "score",

    description: "学生分数"
  }
];

/**
 * 建立 schema 向量索引
 */
async function main() {

  const db = await getDb();

  for (const item of schemas) {

    /**
     * embedding 输入文本
     */
    const text = `
      table: ${item.table}
      column: ${item.column}
      description: ${item.description}
    `;

    console.log("👉 正在索引:");
    console.log(text);

    /**
     * 生成 embedding
     */
    const embedding =
      await getEmbedding(text);

    /**
     * 写入 SQLite
     */
    await db.run(

      `
      INSERT INTO schema_embeddings (

        table_name,

        column_name,

        description,

        embedding

      )
      VALUES (?, ?, ?, ?)
      `,

      [
        item.table,

        item.column,

        item.description,

        JSON.stringify(embedding)
      ]
    );

    console.log(
      `✅ 已写入: ${item.column}`
    );
  }

  console.log(
    "🎉 所有 schema 索引完成"
  );
}

main();