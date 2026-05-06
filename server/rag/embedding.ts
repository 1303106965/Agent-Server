import axios from "axios";
import path from "path";
import dotenv from "dotenv";

/**
 * 加载 .env
 */
dotenv.config({
  path: path.resolve(
    process.cwd(),
    "server/data/.env"
  )
});

/**
 * 智谱 embedding API
 */
const EMBEDDING_URL =
  "https://open.bigmodel.cn/api/paas/v4/embeddings";

/**
 * 获取文本 embedding
 */
export async function getEmbedding(text: string) {

  console.log("👉 正在生成 embedding:");
  console.log(text);

  const res = await axios.post(
    EMBEDDING_URL,

    {
      model: "embedding-3",

      input: text
    },

    {
      headers: {
        Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,

        "Content-Type": "application/json"
      }
    }
  );

  /**
   * 返回向量数组
   */
  return res.data.data[0].embedding;
}