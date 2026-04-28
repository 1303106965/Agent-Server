import { agent } from './agent/agent';

async function main() {
  const result = await agent("查询二班学生");
  console.log("\n✅ 最终结果:\n", result);
}

main();