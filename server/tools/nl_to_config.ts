import { callLLM } from "../ai/llm";

export async function nlToConfig(args: { query: string }) {
  const prompt = `
你是一个SQL配置生成器

请把用户的自然语言转换成如下JSON结构
{
  "config": {
    "defaults": {
      "arg0": {
        "data": {
          "tableName": "students",
          "dbId": "sampledb",
          "columns": [
            { "expression": "*", "alias": "*" }
          ],
          "whereCondition": {
            "children": [
              {
                "key": "age",
                "type": "GT",
                "value": 20
              }
            ],
            "operateType": "AND"
          }
        }
      }
    },
    "fn": "selectSingleTable"
  }
}

要求：
1. 必须返回 JSON
2. 不要解释
规则：
- 大于 → GT
- 大于等于 → GE
- 小于 → LT
- 小于等于 → LE
- 等于 → EQ

❗禁止：
- 不允许把 >= 拆成 GT + EQ
- 禁止 markdown
- 禁止解释
- 不允许编造字段
输出必须是 JSON
用户输入：
${args.query}
`;

  const res = await fetch(
    "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4.5",

        messages: [
          {
            role: "user",
            content: prompt
          }
        ],

        response_format: {
          type: "json_object"
        }
      })
    }
  );

  const data = await res.json();

  console.log("👉 JSON模式返回:");
  console.log(JSON.stringify(data, null, 2));

  return data.choices[0].message.content;
}