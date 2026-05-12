# AI Agent Runtime + Universal DSL + RAG 项目总结

## 一、项目定位

本项目并不是传统的：

* Text2SQL Demo
* AI 聊天机器人
* SQL 生成器

而是一个：

```txt
企业级 AI Query Runtime（AI 查询运行时）
```

目标是实现：

```txt
自然语言
→ Planner（规划器）
→ Universal DSL（统一查询语言）
→ Validator（校验器）
→ Compiler（编译器）
→ SQL / API
→ Runtime Execute（运行时执行）
```

最终目标：

```txt
企业级 AI Data Agent（AI 数据代理）
```

---

# 二、当前项目已经实现的能力

## 1. 自然语言查询（NLQ）

支持：

```txt
用户输入自然语言
```

例如：

```txt
查询年龄大于等于19的学生姓名和性别
```

系统自动进入完整 Runtime Pipeline。

---

## 2. Planner（规划器）

作用：

```txt
自然语言 → DSL
```

目前：

* 使用 GLM（智谱大模型）
* 支持 Prompt 动态拼接
* 支持 RAG Context 注入
* 支持 Tool Call

核心目标：

```txt
让大模型只负责“语义理解”
```

而不是直接生成 SQL。

---

## 3. Universal DSL（统一查询语言）

项目已经开始从：

```txt
Text2SQL
```

升级为：

```txt
Universal Query DSL
```

目前已设计：

* Select DSL
* Insert DSL
* Update DSL
* Delete DSL
* Create Table DSL

DSL 的意义：

```txt
隔离 LLM 与执行层
```

未来：

无论：

* SQLServer
* MySQL
* REST API
* GraphQL
* Spark
* ClickHouse

都可以通过 Compiler 转换。

---

# 三、RAG（检索增强生成）系统

## 1. 当前架构

目前已经实现：

```txt
Schema RAG（数据库结构检索）
```

流程：

```txt
数据库 Schema
→ embedding
→ SQLite 向量库存储
→ cosine similarity（余弦相似度）
→ TopK Retrieval
```

---

## 2. 当前向量库

当前使用：

```txt
SQLite
```

原因：

* 本地部署简单
* 调试方便
* 足够支撑当前规模
* 无额外运维成本

当前阶段：

```txt
CPU 已完全足够
```

无需 GPU。

---

## 3. Embedding（向量化）

当前使用：

```txt
智谱 Embedding 模型
```

作用：

把：

```txt
students.name
```

转换成：

```txt
2048维向量
```

用于语义检索。

---

## 4. 为什么需要 RAG

RAG 的作用不是：

```txt
替代 Prompt
```

而是：

```txt
动态生成 Prompt Context
```

即：

```txt
根据用户问题
动态召回相关字段
```

然后注入 Planner Prompt。

---

# 四、Validator（校验器）

## 1. 为什么必须有 Validator

LLM（大模型）永远：

```txt
不可信
```

即使有 RAG：

仍可能：

* 编造字段
* 错误表名
* 错误操作符
* 危险 delete
* 错误 DSL 结构

所以企业 Runtime 永远不会：

```txt
直接执行 LLM 输出
```

---

## 2. 当前 Validator 架构

当前已经开始实现：

```txt
DSL Validator
```

执行链路：

```txt
DSL
↓
Validator
↓
Compiler
↓
SQL
```

Validator 当前负责：

* table 校验
* columns 校验
* where 校验
* update 安全校验
* delete 安全校验

---

# 五、Compiler（编译器）

## 1. 当前 Compiler 作用

当前 Compiler：

```txt
Universal DSL
→
sqlserverjson
→
SQL
```

注意：

系统已经不是：

```txt
LLM 直接生成 SQL
```

而是：

```txt
LLM 生成 DSL
Code 负责 Compiler
```

这是企业级架构核心。

---

# 六、Runtime（运行时）

## 当前 Runtime 已实现

当前系统已经具备：

* Tool Call
* Planner
* DSL
* RAG
* Validator
* Compiler
* SQL Execute
* CSV Export
* Session Workspace

已经不再是简单 Demo。

当前更接近：

```txt
AI Query Runtime
```

---

# 七、Session Workspace（会话工作区）

当前项目已经支持：

```txt
SqlServerJson/sessions/*
```

用于保存：

* config
* sql
* csv
* runtime logs

后续：

还会加入：

* planner history
* agent memory
* retry trace
* tool trace

---

# 八、MCP（Model Context Protocol）方向

## 1. 当前状态

当前项目：

```txt
还不是完整 MCP
```

但已经开始进入：

```txt
MCP Runtime Architecture
```

---

## 2. MCP 的真正意义

MCP 不是：

```txt
Tool 调用
```

而是：

```txt
Agent Tool Governance（工具治理）
```

未来：

会统一：

* Tool Schema
* Tool Metadata
* Tool Discovery
* Tool Routing
* Tool Permission
* Tool Runtime

---

# 九、为什么项目开始复杂

因为项目已经开始进入：

```txt
AI Runtime Engineering
```

而不是：

```txt
普通前端业务开发
```

---

# 十、当前核心架构思想

## 1. LLM 不负责执行

LLM：

只负责：

```txt
语义理解
```

---

## 2. Code 负责确定性

Code：

负责：

* Validator
* Compiler
* Runtime
* Permission
* Execute

---

## 3. DSL 是系统核心

DSL 的意义：

```txt
统一 Query Protocol（查询协议）
```

它会成为：

整个 Runtime 的核心。

---

# 十一、为什么不直接生成 SQL

因为：

```txt
SQL 只是“执行语言”
```

不是：

```txt
系统协议
```

真正 Runtime：

应该：

```txt
LLM
↓
DSL
↓
Compiler
↓
SQL
```

而不是：

```txt
LLM
↓
SQL
```

---

# 十二、未来路线（非常重要）

## 第一阶段（当前）

当前已进入：

```txt
AI Query Runtime
```

### 已完成

* Text2DSL
* RAG
* SQLite Vector Store
* Validator
* Compiler
* SQL Runtime
* Session Workspace

---

## 第二阶段（即将开始）

### JOIN（多表关联）

未来：

会开始：

* Schema Graph（数据库关系图）
* Foreign Key（外键）
* Join Planner（关联规划器）
* Graph Retrieval（图检索）

真正企业 SQL：

```txt
80% 都是 JOIN
```

---

## 第三阶段

### MCP Runtime

未来：

会实现：

* Tool Registry
* Dynamic Tool Discovery
* Tool Router
* Tool Permission
* Tool Metadata
* Tool Session

---

## 第四阶段

### Agent Memory（智能体记忆）

未来：

会加入：

* Memory Store
* Session Memory
* Long-term Memory
* Retrieval Memory

---

## 第五阶段

### Enterprise Runtime（企业级运行时）

未来：

会实现：

* Query Cost Protection
* Dangerous Query Block
* Retry Runtime
* Observability（可观测性）
* Tool Metrics
* Runtime Logs
* Multi Agent

---

# 十三、当前项目本质

本项目已经不是：

```txt
Text2SQL Demo
```

而是：

```txt
AI Data Operating System（AI 数据操作系统）
```

雏形。

---

# 十四、当前技术方向总结

当前项目融合：

* AI Runtime
* Query Engine
* RAG
* Compiler
* DSL
* Validator
* Agent Runtime
* MCP Architecture
* Vector Database
* Runtime Governance

已经开始进入：

```txt
AI Systems Engineering
```

阶段。

---

# 十五、当前最重要认知

真正企业 AI 系统：

核心不是：

```txt
Prompt
```

而是：

```txt
Runtime Architecture（运行时架构）
```

以及：

```txt
Context Engineering（上下文工程）
```

。
