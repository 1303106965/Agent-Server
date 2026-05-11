## 为什么要添加验证器？会不会和RAG增强冲突
  - 并不冲突，而是结合起来实现，因为RAG召回字段并不是安全字段，RAG的本质只是提高正确率并不是保证正确，对数据库的操作应该要最大程度的保证正确率所以加多一层校验是必须的
  - 这部分完整的架构是RAG -> Planner -> Validator -> Compiler
  - 注意的是这一层将不在依赖大模型而是直接用数据库的schema做检查，以保证正确性

 ### 主要完成以下内容
      1. action 校验
      2. table 是否存在
      3. columns 是否存在
      4. where 字段是否合法
      5. operator 是否合法
      6. update 是否为空
      7. delete 是否危险
      8. create_table 字段是否合法