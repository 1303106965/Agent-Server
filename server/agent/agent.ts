import { callLLM } from "../ai/llm";
import { tools, toolImpl } from "../ai/tools";
import { exec } from "child_process";
import sysMessages from './messages'
/**
 * 执行SQL（调用你现有的 run-and-csv.ts）
 */
function executeSQL(sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const safeSql = sql.replace(/"/g, '\\"');

    const cmd = `npx tsx server/tools/run-and-csv.ts --sql "${safeSql}"`;

    console.log("👉 执行SQL命令:", cmd);

    exec(cmd, (err: any, stdout: string, stderr: string) => {
      if (err) {
        console.error("❌ SQL执行失败:", stderr);
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}

/**
 * 核心 Agent
 */
export async function runAgent(userInput: string) {
  const messages = [
    ...sysMessages,
    {
      role: "user",
      content: userInput
    }
  ]

  for (let i = 0; i < 3; i++) {
    const res = await callLLM(messages, tools);

    console.log("👉 LLM返回:", res);

    const toolCall =
      res.tool_calls?.[0] ||
      (res.function_call && { function: res.function_call });

    if (!toolCall) {
      return res.content;
    }

    const name = toolCall.function.name as keyof typeof toolImpl;
    const args = JSON.parse(toolCall.function.arguments);

    console.log("🧠 调用工具:", name, args);

    const result = await (toolImpl as any)[name](
      args.sql || args.query
    );

    // 👇 把结果喂回模型（关键）
    messages.push(res);
    messages.push({
      role: "tool",
      content: result
    });
  }

  return "❌ 执行失败";
}