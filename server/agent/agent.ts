import { callLLM } from '../ai/llm';
import { tools } from '../ai/tools';

export async function agent(userInput: string) {
  console.log("👤 用户输入:", userInput);

  // Step1：生成SQL（带RAG）
  const sql = await callLLM(userInput);

  console.log("🧠 生成SQL:", sql);

  // Step2：执行SQL
  const result = await tools.executeSQL(sql);

  console.log("📊 查询结果:", result);

  return result;
}