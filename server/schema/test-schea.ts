import {loadSchema} from "./load-schema";

async function main() {

  const schema =
    await loadSchema();

  console.log( JSON.stringify( schema, null, 2 ) );
}

main();