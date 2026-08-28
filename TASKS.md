# StoryBranch — 开发任务与验收（TASKS.md）

> 由原始 `CODEX.md` 拆分，并同步当前已确认的“完整故事”产品语义。

## 1. 开发顺序

必须优先按照以下顺序开发：

```text
1. 初始化项目
   ↓
2. 页面静态布局
   ↓
3. 定义 Story / Branch 类型
   ↓
4. 使用 Mock 数据实现 Branch UI
   ↓
5. 实现选择 Branch
   ↓
6. 实现 Story Tree
   ↓
7. 跑通前端完整 Mock 流程
   ↓
8. 实现 Node API
   ↓
9. 接入真实 LLM Branch Planner
   ↓
10. 接入真实 LLM Story Writer
   ↓
11. 实现下一轮 Branch
   ↓
12. localStorage
   ↓
13. Loading / Error / Retry
   ↓
14. Bug 修复
   ↓
15. UI 优化
   ↓
16. 部署
```

重要原则：

> **先 Mock，后接 AI。**

本文档中的“完整故事”统一指 `fullStory`：初始剧情与每轮 Story Writer 返回的 `content` 持续累积形成的完整正文。Branch 只表示下一步剧情决策，不属于正文；Story Tree 只记录选择路径。

不要在第一阶段同时调试：

- UI；
- 业务逻辑；
- 网络；
- LLM；
- Prompt；

否则出现问题时难以定位。

---

## 2. 第一阶段 Mock 要求

真实 AI 接入前，必须先让以下流程使用 Mock 数据跑通：

```text
输入故事背景和初始剧情
  ↓
点击生成
  ↓
显示 3 个 Branch
  ↓
选择 Branch
  ↓
生成 Mock 新剧情并追加到完整故事
  ↓
Story Tree 更新
  ↓
再次出现新的 Branch
```

只有 Mock 核心流程正常后，再接真实 LLM。

---

## 3. 验收标准

以下全部通过，MVP 才算完成。

```text
[ ] 用户可以输入故事背景

[ ] 用户可以输入初始剧情，并持续查看累积后的完整故事

[ ] 点击按钮可以生成 3 个剧情方向

[ ] 3 个剧情方向存在明显区别

[ ] 用户可以选择其中一个剧情方向

[ ] AI 可以按照用户选择继续故事

[ ] Story Writer 返回的新剧情会追加到完整故事，不会覆盖已有正文

[ ] 新剧情完成后可以继续生成下一轮分支

[ ] Story Tree 可以看到之前的剧情选择

[ ] 刷新页面以后故事状态仍然存在

[ ] AI 请求过程中有 Loading

[ ] Loading 时不会重复发送请求

[ ] API 失败有明确 Error

[ ] Error 后可以 Retry

[ ] LLM JSON 解析异常不会导致页面崩溃

[ ] API Key 不存在前端代码或构建产物中

[ ] 项目可以正常构建

[ ] 核心流程没有明显 Console Error

[ ] 可以通过线上 URL 实际体验
```

所有 P0 + P1 验收通过后：

> **停止新增核心功能。**

---

## 4. 时间控制

目标开发时间：

**约 4 小时。**

绝对上限：

**5 小时。**

推荐：

```text
0:00～0:30
需求、数据结构、Prompt

0:30～1:30
页面 + Mock 核心流程

1:30～2:30
Node API + Branch Planner

2:30～3:15
Story Writer + Story Tree

3:15～4:00
localStorage + Error + Loading

4:00～4:30
Bug + UI

4:30～5:00
部署 + README + 演示准备
```

如果达到 5 小时：

优先提交稳定版本。

不要继续增加功能。

---

## 5. 如果时间不足时的砍功能顺序

如果时间紧张，按照以下顺序舍弃：

第一优先砍：

- 动画；
- Skeleton；
- 移动端细节；
- 一键示例；
- Story Tree 复杂视觉；
- UI 装饰。

第二优先砍：

- 非必要的 localStorage 辅助功能；
- 次要交互；
- 非核心字段。

不能砍：

- 输入故事；
- 生成 3 个 Branch；
- 用户选择；
- AI 续写；
- 下一轮分支；
- 基本 Story Tree；
- Loading；
- Error；
- API Key 服务端保护。

---

## 6. README 最终需要说明

README 最少包含：

```md
# StoryBranch

AI 剧情分支导演。

## Why

很多创作者并不是不会写，而是在故事创作过程中不知道下一步应该如何发展。

StoryBranch 使用 AI 提供多个剧情可能性，而不是直接替用户完成整个故事。

核心理念：

AI 提供可能性，人负责做决定。

## Core Flow

Story
→ AI Branch Planning
→ Human Selection
→ AI Writing
→ Story Tree

## Tech

- Vue 3
- TypeScript
- Vite
- Node.js
- LLM API

## Run

运行方式。

## Environment

LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=

## Current Scope

当前实现内容。

## Trade-offs

为了在有限时间内保证核心链路完整，没有实现：

- Login
- Database
- RAG
- Multi-Agent
- Character Management
- Collaboration
```

---
