import { exec } from "child_process";

export async function nlToConfig(
  args: { query: string }
) {

  console.log(
    "👉 开始调用 to-json:"
  );

  console.log(args.query);

  return new Promise(
    (resolve, reject) => {

      const cmd = `
npx tsx server/tools/sqlserverjson_convert.ts to-json --query "${args.query}"
`;

      console.log(
        "👉 执行命令:"
      );

      console.log(cmd);

      exec(
        cmd,

        (
          err: any,
          stdout: string,
          stderr: string
        ) => {

          if (err) {

            console.error(stderr);

            return reject(stderr);
          }

          /**
           * stdout
           * 就是你的 JSON
           */
          console.log(
            "👉 to-json 返回:"
          );

          console.log(stdout);

          resolve(stdout);
        }
      );
    }
  );
}