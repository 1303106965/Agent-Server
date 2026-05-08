import { QueryDSL }
from "../planner/types";

/**
 * DSL
 * ->
 * sqlserverjson
 */
export function dslToSqlServerJson(
  dsl: QueryDSL
) {

  /**
   * operator 映射
   */
  const operatorMap:
    Record<string, string> = {

    "=": "EQ",

    "!=": "NE",

    ">": "GT",

    "<": "LT",

    ">=": "GE",

    "<=": "LE",

    "LIKE": "LIKE",

    "IN": "IN"
  };

  /**
   * where 条件
   */
  const children =
    dsl.where.map(item => {

      return {

        key: item.field,

        type:
          operatorMap[
            item.operator
          ],

        value: item.value
      };
    });

  /**
   * columns
   */
  const columns =
    dsl.columns.map(col => {

      return {

        expression: col,

        alias: col
      };
    });

  /**
   * 最终 sqlserverjson
   */
  return {

    config: {

      defaults: {

        arg0: {

          data: {

            tableName:
              dsl.table,

            dbId:
              "sampledb",

            columns,

            whereCondition: {

              children,

              operateType:
                "AND"
            }
          }
        }
      },

      fn:
        "selectSingleTable"
    }
  };
}