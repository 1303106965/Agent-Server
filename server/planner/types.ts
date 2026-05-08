/**
 * DSL 条件
 */
export interface DSLCondition {

  /**
   * 字段
   */
  field: string;

  /**
   * 运算符
   */
  operator:
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "LIKE"
  | "IN";

  /**
   * 值
   */
  value: any;
}

/**
 * DSL结构
 */
export interface QueryDSL {

  /**
   * 查询类型
   */
  intent:
  | "select";

  /**
   * 表名
   */
  table: string;

  /**
   * 查询字段
   */
  columns: string[];

  /**
   * 条件
   */
  where: DSLCondition[];
}