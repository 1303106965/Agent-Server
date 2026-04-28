import { exec } from "child_process";

export function runSqlWorkflow(query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `
npx tsx tools/sqlserverjson_convert.ts to-sql --query "${query}" &&
npx tsx tools/exec-sqlserver.ts --yes
`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}