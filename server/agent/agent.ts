import { callLLM } from "../ai/llm";
import { tools, toolImpl } from "../ai/tools";
import { exec } from "child_process";
import sysMessages from './messages';
import { searchSchema } from "../rag/vector-search";

/**
 * 核心 Agent
 */
export async function runAgent(userInput: string) {
  /**
 * 1. RAG 检索相关 schema
 */
  const ragResult =
    await searchSchema(userInput);

  console.log(
    "👉 RAG 检索结果:"
  );

  console.log(
    JSON.stringify(
      ragResult,
      null,
      2
    )
  );

  /**
  * 2. 动态生成 RAG Prompt
  */
  const ragPrompt = `
数据库相关字段：

${ragResult.map(item => `
表: ${item.table}

字段: ${item.column}

描述: ${item.description}
`).join("\n")}

请严格使用以上字段生成SQL。

禁止编造字段。
`;

  /**
  * 3. 构建 messages
  */
  const messages = [

    ...sysMessages,

    {
      role: "system",

      content: ragPrompt
    },

    {
      role: "user",

      content: userInput
    }
  ];

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

    const result = await (toolImpl as any)[name](args);

    // 👇 把结果喂回模型（关键）
    messages.push(res);
    messages.push({
      role: "tool",
      content: result
    });
  }

  return "❌ 执行失败";
}