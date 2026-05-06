import { getDb } from "../db/sqlite";

import { getEmbedding } from "./embedding";

/**
 * 计算余弦相似度
 *
 * 越接近 1
 * 表示语义越相似
 */
function cosineSimilarity(
  a: number[],
  b: number[]
) {

  let dot = 0;

  let normA = 0;

  let normB = 0;

  for (let i = 0; i < a.length; i++) {

    dot += a[i] * b[i];

    normA += a[i] * a[i];

    normB += b[i] * b[i];
  }

  return dot / (
    Math.sqrt(normA) *
    Math.sqrt(normB)
  );
}

/**
 * 向量检索
 */
export async function searchSchema(
  query: string
) {

  console.log("👉 用户查询:");
  console.log(query);

  /**
   * 1. 用户输入转 embedding
   */
  const queryEmbedding =
    await getEmbedding(query);

  /**
   * 2. 读取 schema 向量库
   */
  const db = await getDb();

  const rows = await db.all(
    `SELECT * FROM schema_embeddings`
  );

  /**
   * 3. 计算相似度
   */
  const results = rows.map((row: any) => {

    const embedding =
      JSON.parse(row.embedding);

    const score =
      cosineSimilarity(
        queryEmbedding,
        embedding
      );

    return {

      table: row.table_name,

      column: row.column_name,

      description: row.description,

      score
    };
  });

  /**
   * 4. 按相似度排序
   */
  results.sort(
    (a, b) => b.score - a.score
  );

  /**
   * 5. 返回最像的结果
   */
  return results.slice(0, 5);
}