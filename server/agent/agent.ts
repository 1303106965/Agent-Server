import { client } from '../ai/llm'
import { aiTools } from '../ai/tools'
import { sqliteTool } from '../tools/sqlite.tool'

export async function runAgent(input: string) {
  const res = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [
      {
        role: 'system',
        content: `
你是一个数据库助手：
- 所有涉及数据查询的问题，必须使用 sqlite_query
- 不要直接编造数据
`
      },
      {
        role: 'user',
        content: input
      }
    ],
    tools: aiTools
  })

  const msg = res.choices[0].message

  const call = msg.tool_calls?.[0]

  if (call && call.type === 'function') {
    const fn = call.function
    const args = JSON.parse(fn.arguments)

    if (fn.name === 'sqlite_query') {
      return await sqliteTool.run(args)
    }
  }

  return msg.content
}