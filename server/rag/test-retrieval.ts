import { searchSchema } from "./search-schema";

async function main() {
  const result = await searchSchema("学生姓名");

  console.log(JSON.stringify(result, null, 2));
}

main();
