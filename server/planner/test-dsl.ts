import { nlToDSL } from "./nl-to-dsl";

async function main() {

  const result =
    await nlToDSL(
      "查询年龄大于等于19的学生姓名和性别"
    );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}

main();