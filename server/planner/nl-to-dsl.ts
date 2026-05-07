import { callLLM } from "../ai/llm";
import { searchSchema } from "../rag/vector-search";
/**
 * 自然语言
 * -> DSL
 */
export async function nlToDSL( query: string ) {
/**
 * RAG 检索
 */
const ragResult =
  await searchSchema(query);

console.log(
  "👉 RAG结果:"
);

console.log(
  JSON.stringify(
    ragResult,
    null,
    2
  )
);

/**
 * 动态Schema Prompt
 */
const schemaPrompt =
  ragResult.map(item => {

    return `
      表: ${item.table}

      字段: ${item.column}

      描述: ${item.description}
      `;
  }).join("\n");

  const prompt = `
    你是一个DSL生成器。

    你需要把用户自然语言转换成 DSL JSON。

    DSL结构：

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

    要求：

    1. 只返回 JSON
    2. 禁止 markdown
    3. 禁止解释
    4. operator 只能是：
    = != > < >= <= LIKE IN

    以下是数据库相关字段：

    ${schemaPrompt}

    用户输入：

    ${query}
    `;

  const res = await callLLM(
    [
      {
        role: "user",
        content: prompt
      }
    ],

    []
  );

  console.log("👉 DSL生成结果:");

  console.log(res.content);

  return JSON.parse(
    res.content
  );
}