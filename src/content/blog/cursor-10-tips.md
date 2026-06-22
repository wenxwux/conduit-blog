---
title: "Cursor 提效 10 个隐藏技巧：不换工具，效率再拉高一档"
description: "盘点 10 个 Cursor 中容易被忽略的隐藏功能和快捷操作，涵盖规则系统、Tab 补全、背景 Agent、自动化等，帮你把日常开发效率最大化。"
pubDate: 2026-06-22
tags: ["Cursor", "效率", "AI 编程"]
keywords: ["Cursor 技巧", "Cursor 提效", "Cursor 隐藏功能", "Cursor 快捷键"]
draft: false
---

Cursor 用了一段时间，是不是觉得也就那样——写写对话、按按 Tab 补全？其实你可能只用到了它 30% 的能力。这篇文章盘点 10 个容易被忽略的隐藏技巧，不用换工具，不用装插件，当前版本就能用。

## 技巧 1：用好四层 Rules 系统，而不只是 .cursorrules

很多人只知道在项目根目录放一个 `.cursorrules` 文件，但 Cursor 实际上有**四层规则系统**，优先级从高到低：

| 层级 | 配置位置 | 适用范围 |
|------|----------|----------|
| Team Rules | Cursor 后台设置 | 整个团队 |
| Project Rules | `.cursor/rules/*.mdc` | 当前项目 |
| User Rules | Cursor Settings → Rules | 你的所有项目 |
| AGENTS.md | 项目根目录或子目录 | 对应目录范围 |

关键操作：在 `.cursor/rules/` 目录下创建 `.mdc` 文件（注意是 `.mdc` 不是 `.md`，后者会被忽略），通过 frontmatter 控制生效条件：

```yaml
---
description: "React 组件开发规范"
globs: "src/**/*.tsx, src/**/*.jsx"
alwaysApply: false
---
组件必须用 TypeScript + 函数式写法……
```

四种生效模式可以灵活组合：`alwaysApply: true`（永远加载）、只写 `description`（Claude 智能判断是否加载）、写 `globs`（匹配文件时自动附加）、都不写（只在手动 `@rule-name` 引用时加载）。

**快捷方式**：在 Agent 聊天中输入 `/create-rule`，可以交互式创建规则。

## 技巧 2：Tab 补全逐词接受

大多数人按 Tab 要么全部接受、要么 Escape 全部拒绝。但还有个中间地带：

- **`Cmd + →`**（Mac）/ **`Ctrl + →`**（Windows）：逐词接受补全

当 AI 补全的前半段对了、后半段不太满意时，逐词接受前面正确的部分，然后自己接着打，比重新生成高效得多。

## 技巧 3：Tab 的「跳转预测」和跨文件补全

这是 Tab 最容易被忽略的能力——**接受补全后再按一次 Tab**：

1. Cursor 会**预测你下一个编辑位置**并自动跳转光标
2. 如果改动涉及另一个文件，编辑器底部会弹出一个**传送门窗口**，展示跨文件的建议修改

比如你改了一个函数签名，Tab 会自动跳到调用该函数的地方，提示你同步修改参数。省掉大量手动搜索和跳转。

## 技巧 4：Agent 工作时排队消息

Agent 正在执行任务时，你不用干等——可以直接**输入后续指令**，它会排队顺序执行：

| 操作 | 快捷键 | 效果 |
|------|--------|------|
| 排队消息 | `Enter` | 当前任务完成后按顺序处理 |
| 立即插入 | `Cmd + Enter` | 追加到当前消息，用于紧急纠正 |
| 调整顺序 | 拖拽排队消息 | 重新排列优先级 |

紧急场景：Agent 正在改一个你不想动的文件，`Cmd + Enter` 发送「停，别碰那个文件！」——它会立即读到。

## 技巧 5：设计模式——用画笔指挥 UI 修改

Cursor 内置的浏览器有一个**设计模式**（Design Mode），适合调 UI：

1. 打开 Cursor 内置浏览器，导航到你的运行中的应用
2. 直接在页面上**点击、框选、画圈**标记你想改的地方
3. Agent 读取你的标记，自动修改底层代码

多选元素时，Cursor 能理解它们的布局关系，整体调整。配合语音输入，你可以边指边说，Agent 执行完一个改动后立刻处理下一个口述的需求。

## 技巧 6：云端子代理 /in-cloud

不想让 Agent 占用本地资源？用 `/in-cloud` 把任务丢到云端：

```text
/in-cloud 帮我重构 auth 模块，添加 JWT refresh token 逻辑
```

云端 Agent 在独立 VM 上运行，自动创建分支，完成后提交 PR。你可以同时开启**多个云端 Agent 并行工作**。

更进一步：`/babysit` 命令让云端 Agent 自己跑到 PR 可以合并为止——跑测试、修问题、更新代码，全自动。

**团队协作提示**：在仓库中提交 `.cursor/environment.json`，云端 Agent 会使用预设的环境配置（依赖、环境变量等），整个团队受益。

## 技巧 7：提交前 /review 自查

写完代码不确定质量？在推送前用内置的 review：

```text
/review              # 完整审查（Bug 检测 + 安全审查）
/review-bugbot       # 只跑 Bug 检测
/review-security     # 只跑安全审查
```

Bugbot 在本地跑完后，如果你推送同一份 diff 到 GitHub，它会自动识别已经审查过，跳过重复检查并在 PR 中引用本地审查结果。

## 技巧 8：MCP 变量插值——不起服务器也能用自定义工具

`mcp.json` 配置中支持环境变量插值，很多人不知道：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["${workspaceFolder}/tools/server.js"],
      "env": {
        "API_KEY": "${env:MY_API_KEY}",
        "HOME": "${userHome}"
      }
    }
  }
}
```

三个可用变量：
- `${env:变量名}` — 从系统环境变量读取
- `${userHome}` — 你的用户主目录
- `${workspaceFolder}` — 当前项目根目录

调试 MCP 遇到问题时，`Cmd + Shift + U` 打开 Output 面板 → 选择 **MCP Logs** 下拉项，能看到完整的收发日志和错误信息。

## 技巧 9：按文件类型关闭 Tab 补全

写 Markdown、JSON、YAML 时 Tab 补全经常添乱？可以**按文件类型关闭**：

1. 点击编辑器右下角的 Cursor Tab 状态指示器
2. 选择 **Disable for specific extensions**
3. 添加 `.md`、`.json`、`.yaml` 等

另外还可以**临时暂停** Tab 功能——选一个时长（比如 30 分钟），专注写代码时不受打扰，到时间自动恢复。

## 技巧 10：Checkpoints——比 Git 更细粒度的时间旅行

Agent 每次做出重大改动时，Cursor 会自动拍一个 **Checkpoint 快照**：

- 点击 Agent 面板中的任意 checkpoint，**预览那个时刻的所有文件状态**
- 点 **Restore Checkpoint** 可以完整回滚到那个状态
- 悬停 checkpoint 点 **+** 号，**从那个点创建一个新分支**继续开发

Checkpoint 存储在本地，**独立于 Git**——即使你还没 commit 也能回溯。这在让 Agent 大刀阔斧重构时特别有安全感：放手让它改，改坏了一键回滚。

## 快捷键速查表

| 操作 | Mac | Windows |
|------|-----|---------|
| 打开 Agent 聊天 | `Cmd + I` | `Ctrl + I` |
| 逐词接受 Tab 补全 | `Cmd + →` | `Ctrl + →` |
| 命令面板 | `Cmd + Shift + P` | `Ctrl + Shift + P` |
| 立即发送（跳过排队） | `Cmd + Enter` | `Ctrl + Enter` |
| Output 面板（MCP 调试） | `Cmd + Shift + U` | `Ctrl + Shift + U` |
| Cursor 设置 | `Cmd + Shift + J` | `Ctrl + Shift + J` |

---

这 10 个技巧都是当前版本就能用的，不需要额外配置或付费升级。如果你用 Cursor 配合 Conduit AI 作为 API 后端，可以在 Cursor 的模型设置中填入 Conduit 的 BASE URL，一个入口同时接入 Claude 和 GPT，按量付费约官方 1/8（省约 87%），HK$50 起充、送 HK$5，支持支付宝微信。

---

**相关阅读**：[Codex vs Cursor vs Claude Code 真实对比](/conduit-blog/blog/codex-vs-cursor-vs-claude/) · [Claude Code 快速入门指南](/conduit-blog/blog/claude-code-quickstart/) · [该选哪个模型？](/conduit-blog/blog/which-model-to-use/)
