import { callLLM } from "../ai/llm";

export async function nlToConfig(nl: string) {
  const prompt = `
你是一个SQL配置生成器。

请把用户的自然语言转换成如下JSON结构（严格按照格式）：

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
                "value": 18
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
1. 必须输出 JSON
2. 不要解释
3. 字段必须符合 schema
4. type 必须是 EQ/GT/LT 等

用户输入：
${nl}
`;

  const res = await callLLM([
    { role: "user", content: prompt }
  ], []);

  try {
    return JSON.parse(res.content);
  } catch (e) {
    throw new Error("LLM返回不是合法JSON：" + res.content);
  }
}