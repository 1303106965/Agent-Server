import { validateDSL } from "./validate-dsl";

async function main() {

  const result =
    await validateDSL({

      action: "select",

      table: "students",

      columns: [

        "name",

        "not_exist_field"
      ],

      where: {

        type: "AND",

        children: [

          {

            key: "age",

            type: "GE",

            value: 18
          }
        ]
      }
    });

  console.log(

    JSON.stringify(
      result,
      null,
      2
    )
  );
}

main();