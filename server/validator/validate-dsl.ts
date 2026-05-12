import {
  UniversalDSL,
  Condition,
  ConditionNode,
  ConditionLeaf
} from "../dsl/types";

import { loadSchema } from "../schema/load-schema";

/**
 * 校验结果
 */
export interface ValidationResult {

  success: boolean;

  errors: string[];
}

/**
 * 校验 DSL
 */
export async function validateDSL(

  dsl: UniversalDSL

): Promise<ValidationResult> {

  /**
   * 错误列表
   */
  const errors: string[] = [];

  /**
   * 读取真实数据库 schema
   */
  const schema =
    await loadSchema();

  /**
   * 检查表是否存在
   */
  if (!schema[dsl.table]) {

    errors.push(
      `表不存在: ${dsl.table}`
    );

    return {

      success: false,

      errors
    };
  }

  /**
   * 当前表字段
   */
  const tableColumns =
    schema[dsl.table]
      .map(col => col.name);

  /**
   * 校验 select
   */
  if (dsl.action === "select") {

    /**
     * 校验 columns
     */
    for (
      const column
      of dsl.columns
    ) {

      if (
        !tableColumns.includes(
          column
        )
      ) {

        errors.push(
          `字段不存在: ${column}`
        );
      }
    }

    /**
     * 校验 where
     */
    if (dsl.where) {

      validateCondition(
        dsl.where,
        tableColumns,
        errors
      );
    }
  }

  /**
   * 校验 insert
   */
  if (dsl.action === "insert") {

    for (
      const key
      of Object.keys(
        dsl.values
      )
    ) {

      if (
        !tableColumns.includes(
          key
        )
      ) {

        errors.push(
          `字段不存在: ${key}`
        );
      }
    }
  }

  /**
   * 校验 update
   */
  if (dsl.action === "update") {

    for (
      const key
      of Object.keys(
        dsl.values
      )
    ) {

      if (
        !tableColumns.includes(
          key
        )
      ) {

        errors.push(
          `字段不存在: ${key}`
        );
      }
    }

    /**
     * update 必须带 where
     */
    if (!dsl.where) {

      errors.push(
        "update 必须带 where 条件"
      );
    }
  }

  /**
   * 校验 delete
   */
  if (dsl.action === "delete") {

    /**
     * delete 必须带 where
     */
    if (!dsl.where) {

      errors.push(
        "delete 必须带 where 条件"
      );
    }
  }

  return {

    success:
      errors.length === 0,

    errors
  };
}

/**
 * 校验条件树
 */
function validateCondition(

  condition: Condition,

  tableColumns: string[],

  errors: string[]

) {

  /**
   * ConditionNode
   */
  if (
    "children" in condition
  ) {

    for (
      const child
      of condition.children
    ) {

      validateCondition(

        child,

        tableColumns,

        errors
      );
    }

    return;
  }

  /**
   * ConditionLeaf
   */
  if (
    !tableColumns.includes(
      condition.key
    )
  ) {

    errors.push(
      `where 字段不存在: ${condition.key}`
    );
  }
}