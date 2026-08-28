# StoryBranch — 产品与技术规格（PRODUCT.md）

> 由原始 `CODEX.md` 拆分，并同步当前已确认的“完整故事”产品语义。
> 本文档是 StoryBranch 项目的唯一开发约束文档。  
> Codex 在开始编码前必须完整阅读，并严格遵守。  
> 如本文档与临时实现想法冲突，以本文档为准。

---

## 1. 项目背景

项目名称：

**StoryBranch — AI 剧情分支导演：**

这是一个用于面试实操作业的 AI 产品 Demo。

目标不是做一个完整的故事创作平台，而是在有限时间内完成一个：

- 可以真实体验；
- 核心路径完整；
- AI 参与合理；
- 交互清晰；
- 稳定可演示；

的 MVP。

预计开发时间：

**3～5 小时。**

开发过程中必须优先保证：

> 核心闭环 > 功能数量  
> 稳定可用 > 技术复杂度  
> 产品体验 > 架构炫技

---

## 2. 产品定位

StoryBranch 面向：

- 小说创作者；
- 短剧创作者；
- 漫画创作者；
- 互动故事创作者；
- 其他需要进行剧情创作的人。

核心问题：

> 创作者往往并不是完全不会写，而是在故事进行到某个阶段时，不知道下一步应该如何发展。

普通 AI 写作产品通常直接替用户续写内容。

StoryBranch 不希望完全替用户做决定。

产品核心理念：

> **AI 提供可能性，人负责做决定。**

AI 的主要职责：

1. 理解当前故事；
2. 给出多个明显不同的剧情发展方向；
3. 用户选择其中一个方向；
4. AI 根据用户选择继续故事；
5. 再次提供新的剧情方向。

AI 不负责一次性自动完成整个故事。

---

## 3. 核心用户路径

整个 MVP 只需要完整实现以下路径：

```text
输入故事背景 / 初始剧情
        ↓
点击「生成剧情分支」
        ↓
AI 生成 3 个明显不同的发展方向
        ↓
用户选择其中一个方向（Branch）
        ↓
AI 根据完整故事和选择续写下一段剧情
        ↓
将 Story Writer 返回的 content 追加到完整故事
        ↓
生成新的 3 个剧情方向
        ↓
Story Tree 记录用户之前的剧情选择
```

只要这条路径完整、稳定、可以实际体验，MVP 即视为完成。

本项目中，`fullStory` 的唯一语义是：

> 到目前为止已经形成的完整故事正文。

它持续累积形成：

```text
fullStory = 初始剧情 + 每轮 Story Writer 返回的 content
```

- Branch 是“下一步剧情决策”，不属于故事正文；
- `selectedBranch` 只作为 Story Writer 的创作指令；
- 只有 Story Writer 返回的 `content` 会追加进入 `fullStory`；
- Story Tree 只记录创作决策路径，不承担完整正文展示。

---

## 4. MVP 功能范围

### P0：必须完成

- 故事背景输入；
- 初始剧情输入及完整故事正文展示；
- AI 生成 3 个剧情发展方向；
- 三个方向必须存在明显区别；
- 用户可以选择其中一个剧情方向；
- AI 根据选择继续故事；
- 新剧情完成后可以再次生成下一轮剧情方向；
- Story Tree 展示用户已经做出的剧情选择；
- 页面刷新后可以恢复当前故事状态；
- API Key 不暴露在浏览器端。

### P1：完成核心流程后补充

- Loading；
- Empty State；
- API Error；
- Retry；
- 防止重复请求；
- JSON 解析异常处理；
- 基础响应式布局；
- 基础输入校验。

### P2：仅在 P0、P1 完成后考虑

- UI 微调；
- 简单过渡动画；
- 示例故事；
- Skeleton；
- 当前节点高亮；
- Story Tree 视觉优化；
- README；
- 演示体验优化。

---

## 5. 明确禁止实现的功能

除非用户后续明确要求，否则禁止主动增加以下功能：

- 登录；
- 注册；
- 用户系统；
- OAuth；
- 数据库；
- PostgreSQL；
- MySQL；
- MongoDB；
- Redis；
- Prisma；
- 云端作品管理；
- 社区；
- 评论；
- 点赞；
- 分享系统；
- 多人协作；
- RAG；
- Embedding；
- Vector Database；
- Retriever；
- Rerank；
- LangChain；
- LangGraph；
- Multi-Agent；
- Planner Agent；
- Writer Agent；
- Reviewer Agent；
- Character Agent；
- Director Agent；
- 复杂 Workflow；
- 微服务；
- WebSocket；
- 消息队列；
- AI 图片生成；
- AI 视频生成；
- TTS；
- 语音输入；
- 完整人物管理；
- 完整世界观管理；
- 富文本编辑器；
- 复杂 Graph Editor；
- 支付；
- 商业化系统。

如果某个功能无法直接增强核心用户路径，则默认不实现。

---

## 6. 技术栈约束

优先使用以下技术：

### 前端

- Vue 3
- TypeScript
- Vite
- Composition API
- Tailwind CSS（如项目已配置）

### 后端

- Node.js
- Express

### AI

- OpenAI Compatible API
- 通过服务端调用 LLM

### 数据

- localStorage

### 部署

使用最简单、最熟悉的方案即可。

禁止为了“技术完整性”临时引入新的框架或基础设施。

---

## 7. 推荐项目结构

保持项目简单。

```text
story-branch/
│
├── src/
│   ├── components/
│   │   ├── StoryEditor.vue
│   │   ├── BranchCard.vue
│   │   └── StoryTree.vue
│   │
│   ├── composables/
│   │   └── useStory.ts
│   │
│   ├── services/
│   │   └── storyApi.ts
│   │
│   ├── types/
│   │   └── story.ts
│   │
│   ├── App.vue
│   └── main.ts
│
├── server/
│   ├── routes/
│   ├── services/
│   │   └── llm.ts
│   └── index.ts
│
├── CODEX.md
├── README.md
├── .env
├── .env.example
└── package.json
```

如果现有项目结构已经能够清晰实现需求，不要为了匹配该目录结构而进行无意义重构。

---

## 8. 页面结构

优先实现单页面。

建议布局：

```text
┌────────────────────────────────────────────────────────────┐
│                        StoryBranch                          │
│                    AI 剧情分支导演                         │
├──────────────────┬──────────────────────┬──────────────────┤
│                  │                      │                  │
│   故事正文        │   下一步怎么发展？   │     创作路径     │
│                  │                      │                  │
│   故事背景        │    分支 A            │   ● 开始         │
│   完整故事正文    │    分支 B            │   │              │
│                  │    分支 C            │   └─● 当前节点    │
│   生成剧情分支    │                      │                  │
│                  │                      │                  │
└──────────────────┴──────────────────────┴──────────────────┘
```

不要为了布局效果引入重量级 UI 框架。

---

## 9. Story Tree 约束

Story Tree 只是为了展示：

> 用户之前选择了哪些剧情方向。

它只记录创作决策路径，不展示 `fullStory`，也不承担完整正文阅读职责。

第一版只需要做成简单纵向节点。

示例：

```text
● 收到未来来信
│
└── ● 现实开始改变
      │
      └── ● 出现陌生照片
            │
            └── ○ 当前节点
```

禁止为了 Story Tree：

- 引入复杂图编辑器；
- 实现拖拽；
- 实现节点缩放；
- 实现无限画布；
- 实现复杂 DAG；
- 实现图数据库。

---

## 10. AI 任务拆分

AI 功能拆成两个独立任务。

---

## 10.1 Task A：剧情规划

职责：

> 根据已有故事，生成 3 个明显不同的剧情发展方向。

输入：

- 故事背景；
- `fullStory`（到目前为止的完整故事正文）；
- 已有剧情节点摘要；
- 用户之前的选择。

输出：

- 完整故事的当前摘要；
- 3 个剧情方向。

AI 不负责在这个阶段直接续写长篇故事。

---

## 10.2 Task B：剧情续写

职责：

> 根据用户选中的剧情方向，继续创作下一段故事。

输入：

- 故事背景；
- `fullStory`（到目前为止的完整故事正文）；
- 已有剧情节点摘要和之前的选择；
- 用户选择的 Branch。

输出：

- 下一段剧情正文；
- 一句简短摘要。

摘要用于 Story Tree。

---

## 11. AI 调用流程

推荐流程：

```text
fullStory V1
  ↓
Branch Planner
  ↓
3 Branches
  ↓
Human Selection
  ↓
Story Writer
  ↓
将 content 追加到 fullStory，得到 fullStory V2
  ↓
Branch Planner
```

强调：

> “决定接下来写什么”和“真正把内容写出来”是两个不同的模型任务。

不要使用一个巨大 Prompt 同时完成全部工作。

---

## 12. Branch 数据结构

建议使用：

```ts
export interface Branch {
  id: string
  title: string
  description: string
  tone: string
  risk?: string
}
```

生成剧情方向时，LLM 返回类似：

```json
{
  "summary": "林夏收到了一封来自未来自己的信。",
  "branches": [
    {
      "id": "branch_1",
      "title": "调查神秘寄件人",
      "description": "林夏开始追查信件来源，却发现邮局根本不存在这封信的寄送记录。",
      "tone": "悬疑",
      "risk": "调查可能暴露她自己的秘密"
    },
    {
      "id": "branch_2",
      "title": "阻止未来事故",
      "description": "信中预言三天后将发生一起严重事故。",
      "tone": "紧张",
      "risk": "改变未来可能产生新的后果"
    },
    {
      "id": "branch_3",
      "title": "现实开始改变",
      "description": "读完信后，她发现现实中的某些事情正在发生变化。",
      "tone": "科幻",
      "risk": "她可能已经进入另一条时间线"
    }
  ]
}
```

---

## 13. StoryNode 数据结构

建议：

```ts
export interface StoryNode {
  id: string
  parentId?: string

  title: string
  content: string
  summary: string

  branches: Branch[]

  selectedBranch?: Branch

  createdAt: number
}
```

其中 `StoryNode.content` 表示该节点对应的单次剧情片段，不是完整故事。调用 LLM 时，完整正文只从 `fullStory` 提供；历史信息只传递节点摘要和历史选择，不能再次拼入 `StoryNode.content`，以免正文重复。

前端可以维护：

```ts
const storyNodes = ref<StoryNode[]>([])
```

不需要为此引入复杂状态管理库。

如果 Composition API 足够，就不要引入 Pinia。

---

## 14. 数据持久化

MVP 使用：

```text
localStorage
```

即可。

例如：

```ts
localStorage.setItem('story-branch', JSON.stringify(storyNodes.value))
```

页面初始化时读取并恢复。

禁止为 MVP 引入数据库。

---

## 15. LLM API 安全约束

禁止在浏览器端直接暴露 API Key。

错误结构：

```text
Vue
 ↓
LLM API
```

正确结构：

```text
Browser
   ↓
Node API
   ↓
LLM API
```

例如：

```text
POST /api/story/branches
POST /api/story/continue
```

`.env.example`：

```env
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=
```

真实 `.env` 必须加入 `.gitignore`。

禁止：

- 将真实 API Key 写入源码；
- 将真实 API Key 提交 Git；
- 将 API Key 写进前端环境变量并打包到浏览器。

---

## 16. 剧情规划 Prompt

可使用以下 Prompt 作为基础。

```text
你是一名专业的故事剧情导演。

你的任务不是直接替用户完成整个故事，而是帮助用户探索不同的剧情发展可能性。

请根据：

1. 故事背景
2. fullStory（到目前为止的完整故事正文）
3. 用户之前的剧情选择

生成 3 个明显不同的剧情发展方向。

要求：

1. 三个方向不能只是措辞不同；
2. 三个方向应该在人物目标、冲突或剧情走向上存在明显差异；
3. 每个方向都必须能够自然承接完整故事；
4. 不得引入与前文明显矛盾的设定；
5. 每个方向描述控制在 80 字以内；
6. 每个方向提供简短的风格标签；
7. 返回严格 JSON；
8. 不要输出 JSON 之外的任何内容。
```

目标返回：

```json
{
  "summary": "...",
  "branches": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "tone": "...",
      "risk": "..."
    }
  ]
}
```

必须校验：

- `branches` 存在；
- 数量为 3；
- 必要字段存在；
- 返回结构可解析。

如果 LLM 返回异常，不要让页面直接崩溃。

---

## 17. 剧情续写 Prompt

基础 Prompt：

```text
你是一名专业故事编剧。

请根据：

1. 故事背景
2. fullStory（到目前为止已经发生的完整故事正文）
3. 用户选择的剧情方向

继续创作下一段剧情。

要求：

1. 自然承接前文；
2. 保持已有角色设定一致；
3. 必须推动剧情发展；
4. 不要一次解决当前所有冲突；
5. 保留下一步剧情继续发展的空间；
6. 不随意增加与前文冲突的设定；
7. 控制在 300～500 字；
8. 同时生成一句剧情摘要，用于剧情树展示。

返回严格 JSON：

{
  "content": "...",
  "summary": "..."
}

不要输出 JSON 之外的其他内容。
```

---

## 18. 固定 Demo 故事

为了开发和演示，可以提供一个一键载入的 Demo。

### 故事背景

```text
这是一部现代都市背景下的时间悬疑故事。

28 岁的林夏独居，是一家互联网公司的产品经理。

她性格理性，不相信超自然现象。
```

### 初始剧情

```text
晚上十一点，林夏回到家。

门口放着一个没有寄件人信息的信封。

信封已经泛黄，看起来像是存放了很多年。

但右上角的邮戳日期，却显示的是三天之后。

林夏拆开信。

里面只有一句话：

“三天后的晚上十点，无论发生什么，都不要打开地下室的门。”

落款只有两个字：

林夏。

那正是她自己的名字。
```

示例功能属于 P2。

如果时间不足，不必实现“一键加载”，但可以用于开发测试。

---

## 19. 必须处理的 UI 状态

### 19.1 Empty State

用户没有输入故事时，不调用 AI。

示例提示：

```text
先输入一段故事，再让 AI 帮你探索可能的发展方向。
```

---

### 19.2 Loading

生成分支：

```text
AI 正在规划剧情方向...
```

续写：

```text
AI 正在继续故事...
```

Loading 时禁止重复点击相关操作。

---

### 19.3 Error

示例：

```text
剧情生成失败，请重新尝试。
```

提供：

```text
重新生成
```

或者：

```text
重试
```

---

### 19.4 JSON Error

如果模型输出无法解析：

- 不允许应用崩溃；
- 给用户展示通用错误；
- 允许重新请求；
- 控制台记录必要调试信息。

---

## 20. UI 设计约束

目标：

> 看起来像一个完整产品，而不是一个 API 测试页面。

但不要过度投入视觉设计。

至少需要：

- 清晰的信息层级；
- 统一间距；
- Branch 使用卡片展示；
- CTA 按钮明确；
- 当前选中 Branch 有明显状态；
- Story Tree 当前节点可识别；
- Loading 不导致页面跳动严重；
- Error 信息清晰。

禁止为了视觉效果投入大量时间制作：

- 复杂动画；
- 3D；
- Canvas 特效；
- 复杂背景；
- 花哨粒子；
- 大量插画。

---

## 21. 最终产品表达

整个项目的核心产品表达始终保持一致：

> **AI 不应该替创作者决定故事，而应该帮助创作者看到更多可能性。**

对应产品流程：

```text
AI 理解完整故事
        ↓
AI 提供多个可能方向
        ↓
用户做最终选择
        ↓
AI 根据选择执行
```

而不是：

```text
用户输入
  ↓
AI 自动完成一切
```

任何新增功能都必须判断：

> 是否强化了这个核心价值？

如果没有，则不要实现。

---
