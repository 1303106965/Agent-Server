## 抽离一层planner。用于大模型生成合约方案json

  - 由于最终合约配置方案多样性，比如规则会越来越完善，报错不限于MDB,卡夫卡,SQL server等各种配置方案对应不同的规则所以抽离一层单独维护很重要
  - 为什么不用大模型直接生成，因为大模型擅长的是语义理解而不是场景化的结构生成，不可避免的会有误差，所以schema尽量交给tool保证准确性和以后方便迭代更新
  - 流程是 NL -> 中间DSL -> sqlserverjson -> sql
  理想效果如下
    用户：查询年龄大于19的学生姓名和性别
    -> LLM不会直接生成我们复杂的schema而是判断其差异性先生成一个简化DSL
    -> DSL: {
        "intent": "select",
        "table": "students",
        "columns": [
          "name",
          "gender"
        ],
        "where": [
          {
            "field": "age",
            "operator": ">=",
            "value": 19
          }
        ]
      }
    -> DSL => SQLServerJson => sql
