import { callLLM } from "../ai/llm";

export async function nlToConfig(args: { query: string }) {
  const prompt = `
你是一个SQL配置生成器。

请把用户的自然语言转换成如下JSON结构（严格输出JSON，不要解释）：

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
1. 必须返回 JSON
2. 不要解释
3. type 只能是 EQ / GT / LT / LIKE / IN 等
4. 不允许编造字段

用户输入：
${args.query}
`;

  const res = await callLLM(
    [{ role: "user", content: prompt }],
    [] // ❗这里不要 tools
  );

  return res.content; // ⚠️ 直接返回 JSON字符串
}