import {
  dslToSqlServerJson
}
from "./dsl-to-json";

const dsl = {

  intent: "select",

  table: "students",

  columns: [
    "name",
    "gender"
  ],

  where: [
    {
      field: "age",

      operator: ">=",

      value: 19
    }
  ]
};

const result =
  dslToSqlServerJson(dsl);

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);