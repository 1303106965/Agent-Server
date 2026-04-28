import { callLLM } from "../ai/llm";
import { tools } from "../ai/tools";
import { runSqlWorkflow } from "./sqlWorkflow";

export async function runAgent(userInput: string) {
  const messages = [
    {
      role: "system",
      content: `
你是数据库智能助手。

如果用户涉及数据查询：
必须调用 sql_workflow 工具。

禁止直接返回SQL。
禁止编造数据。
`
    },
    {
      role: "user",
      content: userInput
    }
  ];

  const res = await callLLM(messages, tools);

  const toolCall =
    res.tool_calls?.[0] ||
    (res.function_call && { function: res.function_call });

  if (toolCall) {
    const args = JSON.parse(toolCall.function.arguments);

    if (toolCall.function.name === "sql_workflow") {
      return await runSqlWorkflow(args.query);
    }
  }

  return res.content;
}