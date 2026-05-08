import { searchSchema } from "../rag/search-schema";

import dotenv from "dotenv";

import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "server/data/.env"),
});

/**
 * 自然语言
 * ->
 * DSL
 */
export async function nlToDSL(userInput: string) {
  console.log("\n🔍 RAG召回中...");

  /**
   * 检索字段
   */
  const schema = await searchSchema(userInput);

  /**
   * 拼接 schema prompt
   */
  const schemaPrompt = schema
    .map((item) => {
      return `

表:
${item.table_name}

字段:
${item.column_name}

类型:
${item.data_type}

`;
    })
    .join("\n");

  console.log("\n📚 RAG结果:");

  console.log(schemaPrompt);

  /**
   * Planner Prompt
   */
  const prompt = `

你是一个DSL生成器。

你的任务：

把用户自然语言转换成 DSL。

--------------------------------

【数据库结构】

${schemaPrompt}

--------------------------------

DSL格式：

{
  "intent": "select",

  "table": "students",

  "columns": [
    "name",
    "gender"
  ],

  "where": [
    {
      "field": "age",

      "operator": ">=",

      "value": 19
    }
  ]
}

--------------------------------

规则：

1.
只能使用数据库中存在的字段

2.
不要编造字段

3.
operator只能是：

=
!=
>
<
>=
<=
LIKE
IN

4.
只返回JSON

5.
不要markdown

6.
不要解释

--------------------------------

用户输入：

${userInput}

`;

  console.log("\n🧠 Planner Prompt:");

  console.log(prompt);

  /**
   * 调用模型
   */
  const res = await fetch(
    "https://open.bigmodel.cn/api/paas/v4/chat/completions",

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
      },

      body: JSON.stringify({
        model: "glm-4.5",

        messages: [
          {
            role: "user",

            content: prompt,
          },
        ],

        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  const data = await res.json();

  console.log("\n🤖 Planner返回:");

  console.log(JSON.stringify(data, null, 2));

  /**
   * 返回 DSL
   */
  return JSON.parse(data.choices[0].message.content);
}
