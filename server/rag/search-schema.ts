import Database from "better-sqlite3";

import path from "path";

import { getEmbedding } from "./embedding";

/**
 * SQLite
 */
const db = new Database(path.resolve(process.cwd(), "server/data/data.db"));

/**
 * 余弦相似度
 */
function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;

  let normA = 0;

  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];

    normA += a[i] * a[i];

    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 搜索 schema
 */
export async function searchSchema(query: string) {
  console.log("\n🔍 开始检索Schema:");

  console.log(query);

  /**
   * query embedding
   */
  const queryEmbedding = await getEmbedding(query);

  /**
   * 读取所有schema
   */
  const rows = db
    .prepare(
      `
      SELECT *
      FROM schema_embeddings
      `
    )
    .all() as any[];

  /**
   * 相似度计算
   */
  const scored = rows.map((row) => {
    const embedding = JSON.parse(row.embedding);

    const score = cosineSimilarity(queryEmbedding, embedding);

    return {
      ...row,

      score,
    };
  });

  /**
   * 排序
   */
  scored.sort((a, b) => b.score - a.score);

  /**
   * TopK
   */
  const topK = scored.slice(0, 5);

  console.log("\n🎯 TopK:");

  console.log(topK);

  return topK;
}
