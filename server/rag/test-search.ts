import { searchSchema }
  from "./vector-search";

async function main() {

  const result =
    await searchSchema(
      "查询学生姓名"
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