import { runAgent } from './agent/agent';

async function main() {
  const result = await runAgent("查询年龄大于18的学生");
  console.log("\n✅ 最终结果:\n", result);
}

main();