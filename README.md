# StoryBranch — AI 剧情分支导演

AI 提供剧情可能性，创作者决定故事走向。

## Why

我没有选择做一个通用 AI 故事生成器。

StoryBranch 解决的是创作者已经开始写作，但卡在“下一步剧情应该怎么发展”的问题。AI 不直接替用户决定整个故事，而是提供三个明显不同的发展方向，由用户选择后再继续创作。

## 核心用户流程

```text
输入故事
→ AI 生成 3 个剧情方向
→ 用户选择
→ AI 根据选择续写
→ 完整故事累积
→ AI 再生成下一轮方向
→ Story Tree 记录创作路径
```

## AI 如何参与

AI 被拆分为两个职责明确的 LLM Task：

### Branch Planner

- 理解到目前为止的完整故事；
- 生成三个明显不同的下一步剧情方向。

### Story Writer

- 根据完整故事和用户选择的方向；
- 续写下一段故事正文，并生成用于 Story Tree 的简短摘要。

Branch 是创作决策，不是故事正文。只有 Story Writer 返回的 `content` 会追加进入完整故事。

## 当前实现

- AI Branch Planner；
- AI Story Writer；
- 多轮故事创作与完整正文累积；
- Story Tree 创作路径；
- 基于 localStorage 的当前会话持久化；
- Loading、Error 与 Retry；
- 基础输入校验与重复请求保护；
- OpenAI Compatible API 接入。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Node.js
- Express
- OpenAI Compatible API

## 本地运行

安装依赖：

```bash
npm install
```

复制环境变量示例并填写模型配置：

```bash
cp .env.example .env
```

在第一个终端启动 Node API（默认监听 `http://127.0.0.1:3001`）：

```bash
npm run dev:server
```

在第二个终端启动 Vue 开发服务器：

```bash
npm run dev
```

Vite 会将开发环境下的 `/api` 请求代理到 Node API。

可选检查：

```bash
npm run test:server
npm run build
```

## 环境变量

```dotenv
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=
```

## Trade-offs

这是一个在有限时间内完成的产品切片，因此主动没有实现：

- 登录；
- 数据库；
- RAG；
- Multi-Agent；
- 完整角色管理；
- 世界观管理；
- 复杂故事版本系统。

实现优先保证核心创作路径完整、稳定、可体验，而不是扩大功能范围或增加架构复杂度。

## 后续方向

- 为长故事增加 Context 压缩，控制上下文长度与成本；
- 增加角色一致性约束，减少多轮续写中的人物偏移；
- 支持故事版本与分支回溯，让创作者比较不同选择。

## 安全说明

`.env` 不提交到 Git。LLM API Key 只由 Node 服务端读取，不会进入 Vue 前端代码或浏览器响应。
