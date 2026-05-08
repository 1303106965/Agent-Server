import { exec } from "child_process";

/**
 * 执行SQL
 */
export async function executeSQL(
  sql: string,

  output?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    /**
     * 转义双引号
     */
    const safeSql = sql.replace(/"/g, '\\"');

    /**
     * output参数
     */
    const outputArg = output ? `--output "${output}"` : "";

    /**
     * 执行命令
     */
    const cmd = `

npx tsx server/tools/run-and-csv.ts

--sql "${safeSql}"

${outputArg}

`;

    console.log("\n👉 execute_sql:");

    console.log(cmd);

    exec(
      cmd,

      (err: any, stdout: string, stderr: string) => {
        if (err) {
          console.error(stderr);

          return reject(stderr);
        }

        resolve(stdout);
      }
    );
  });
}
