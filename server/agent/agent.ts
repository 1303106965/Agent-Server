import { nlToDSL } from "../planner/nl-to-dsl";
import path from "path";
import { dslToSqlServerJson } from "../compiler/dsl-to-json";

import { exec } from "child_process";

import fs from "fs";

/**
 * Agent Runtime
 */
export async function runAgent( userInput: string ) {
  /**
   * Session ID
   */
  const sessionId =
    new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

  /**
   * Session目录
   */
  const sessionDir =
    path.join(
      "SqlServerJson",
      "sessions",
      sessionId
    );

  /**
   * 创建目录
   */
  fs.mkdirSync(
    sessionDir,
    {
      recursive: true
    }
  );
  console.log(
    "\n===================="
  );

  console.log(
    "🚀 Agent启动"
  );

  console.log("====================\n");

  /**
   * Step1
   * NL -> DSL
   */
  console.log("🧠 Step1: NL -> DSL");

  const dsl = await nlToDSL(userInput);
  console.log( JSON.stringify( dsl, null, 2 ) );
  
  /**
   * Step2
   * DSL -> sqlserverjson
   */
  console.log("\n⚙️ Step2: DSL -> sqlserverjson");

  const config = dslToSqlServerJson(dsl);

  fs.writeFileSync( 
    path.join( sessionDir, "config.json" ),
    JSON.stringify( config, null, 2 )
  );
  fs.writeFileSync(
    path.join(sessionDir,"input.txt"),
    userInput
  );
  /**
   * Step3
   * 保存 config
   */
  console.log("\n💾 Step3: 保存 config");

  const configPath = "temp_config.json";

  fs.writeFileSync( configPath, JSON.stringify( config, null, 2 ) );

  console.log("✅ config已保存");

  /**
   * Step4
   * config -> SQL
   */
  console.log("\n🔄 Step4: config -> SQL");

  const sql = await convertToSQL( configPath );

  console.log( sql );
  const sqlPath = path.join( sessionDir,"query.sql" );

  fs.writeFileSync( sqlPath, sql );
  /**
   * Step5
   * 执行SQL
   */
  console.log( "\n📊 Step5: 执行SQL" );

  const result = await executeSQL(sql);

  console.log(result);
  const csvPath = path.join( sessionDir, "result.csv" );
  console.log( "\n✅ Agent执行完成" );

  return result;
}

/**
 * config -> SQL
 */
function convertToSQL(
  file: string
): Promise<string> {

  return new Promise(
    (resolve, reject) => {

      const cmd = ` npx tsx server/tools/sqlserverjson_convert.ts to-sql --file ${file}`;

      console.log("👉 执行:");

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
           * 提取 SQL
           */
          const sql = stdout.trim();

          resolve(sql);
        }
      );
    }
  );
}

/**
 * 执行 SQL
 */
function executeSQL(
  sql: string
): Promise<string> {

  return new Promise(
    (resolve, reject) => {
      /**
       * 转义双引号
       */
      const safeSql = sql.replace(/"/g,'\\"');
      console.log(sql,safeSql,'😁');
      
      const cmd = `npx tsx server/tools/run-and-csv.ts --sql "${safeSql}"`;

      console.log("👉 执行:");

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

          resolve(stdout);
        }
      );
    }
  );
}