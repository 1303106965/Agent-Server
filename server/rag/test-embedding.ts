import { getEmbedding } from "./embedding";

async function main() {

  const vector = await getEmbedding(
    "students name 学生姓名"
  );

  console.log("✅ embedding 生成成功");

  console.log(vector);

  console.log("向量长度:", vector.length);
}

main();