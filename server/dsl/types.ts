/**
 * DSL Action
 */
export type DSLAction =

  | "select"

  | "insert"

  | "update"

  | "delete"

  | "create_table";

/**
 * 条件操作符
 */
export type ConditionOperator =

  | "EQ"

  | "NE"

  | "GT"

  | "GE"

  | "LT"

  | "LE"

  | "LIKE"

  | "IN";

/**
 * 条件节点
 */
export interface ConditionNode {

  /**
   * AND / OR
   */
  type:
    "AND" | "OR";

  children:
    Condition[];
}

/**
 * 叶子条件
 */
export interface ConditionLeaf {

  /**
   * 字段
   */
  key: string;

  /**
   * 操作符
   */
  type:
    ConditionOperator;

  /**
   * 值
   */
  value: any;
}

/**
 * Condition
 */
export type Condition =

  | ConditionNode

  | ConditionLeaf;

/**
 * Select DSL
 */
export interface SelectDSL {

  action:
    "select";

  table:
    string;

  columns:
    string[];

  where?:
    ConditionNode;
}

/**
 * Insert DSL
 */
export interface InsertDSL {

  action:
    "insert";

  table:
    string;

  values:
    Record<string, any>;
}

/**
 * Update DSL
 */
export interface UpdateDSL {

  action:
    "update";

  table:
    string;

  values:
    Record<string, any>;

  where?:
    ConditionNode;
}

/**
 * Delete DSL
 */
export interface DeleteDSL {

  action:
    "delete";

  table:
    string;

  where?:
    ConditionNode;
}

/**
 * Create Table Column
 */
export interface CreateTableColumn {

  /**
   * 列名
   */
  name: string;

  /**
   * 类型
   */
  type: string;

  /**
   * 中文标题
   */
  title?: string;

  /**
   * 是否主键
   */
  primaryKey?: boolean;

  /**
   * 是否允许空
   */
  nullable?: boolean;

  /**
   * 默认值
   */
  defaultValue?: any;
}

/**
 * Create Table DSL
 */
export interface CreateTableDSL {

  action:
    "create_table";

  table:
    string;

  columns:
    CreateTableColumn[];
}

/**
 * Universal DSL
 */
export type UniversalDSL =

  | SelectDSL

  | InsertDSL

  | UpdateDSL

  | DeleteDSL

  | CreateTableDSL;