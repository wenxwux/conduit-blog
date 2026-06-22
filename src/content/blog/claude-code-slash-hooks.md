---
title: "Claude Code 自定义 slash 命令与 hooks 实战：把高频操作固化成一键"
description: "手把手教你写 Claude Code 自定义 slash 命令（skills）和 hooks，把代码审查、格式化、安全检查等高频操作固化成一键触发，告别重复劳动。"
pubDate: 2026-06-22
tags: ["Claude Code", "效率", "自动化"]
keywords: ["Claude Code slash 命令", "Claude Code hooks", "自定义命令", "Claude Code skills"]
draft: false
---

每天用 Claude Code 写代码，有没有发现自己在反复做同样的事？每次提交前跑 lint、每次改完文件手动格式化、每次 review 都要把同一段提示词粘贴进去……

好消息是，Claude Code 原生支持两套自动化机制：**自定义 slash 命令（Skills）** 和 **Hooks**。前者让你把常用提示词打包成 `/xxx` 一键调用；后者让你在工具执行前后自动触发检查脚本。两者配合，能把你的 Claude Code 变成一个高度定制的个人工作流引擎。

## 理解两套机制的分工

先搞清楚它们各自解决什么问题，免得用错场景：

| 维度 | Slash 命令（Skills） | Hooks |
|------|----------------------|-------|
| 触发方式 | 手动输入 `/命令名` 或 Claude 自动匹配 | 在特定生命周期事件中自动触发 |
| 本质 | 一段带 frontmatter 的 Markdown 提示词 | 一条 shell 命令 / HTTP 请求 / MCP 调用 |
| 典型用途 | 代码审查、生成模板、总结变更 | 自动格式化、拦截危险操作、安全扫描 |
| 存放位置 | `.claude/skills/<名称>/SKILL.md` | `.claude/settings.json` 或 `~/.claude/settings.json` |
| 谁来执行 | Claude（读取指令后用工具完成任务） | 系统（在 Claude 调用工具前后自动运行） |

一句话总结：**Skills 是「我想让 Claude 做什么」，Hooks 是「Claude 做某件事时系统自动做什么」**。

## 实战 1：写一个自定义 slash 命令

最常见的场景——你每次 commit 前都想让 Claude 帮你总结变更、找潜在风险。与其每次手打提示词，不如固化成 `/review-changes`。

### 第一步：创建目录和文件

```bash
# 项目级（只对当前项目生效）
mkdir -p .claude/skills/review-changes

# 或者个人级（所有项目都能用）
mkdir -p ~/.claude/skills/review-changes
```

### 第二步：编写 SKILL.md

```yaml
---
description: 总结未提交的代码变更并标记潜在风险。当用户问"改了什么"或"帮我 review"时自动触发。
disable-model-invocation: false
---

## 当前变更

!`git diff HEAD`

## 指令

请根据上面的 diff 完成以下任务：
1. 用 3-5 个要点总结本次变更
2. 标出潜在风险（缺少错误处理、硬编码值、遗漏的测试等）
3. 如果 diff 为空，告知没有未提交的变更
```

这里有两个关键点：

- `` !`git diff HEAD` `` 是**动态上下文注入**——Claude Code 会先执行这条命令，把输出内联到提示词里，Claude 看到的直接就是你的最新 diff
- `description` 不只是给人看的，Claude 也靠它判断是否自动加载这个 skill

### 第三步：测试

```text
> /review-changes          # 手动调用
> 帮我看看改了什么           # Claude 自动匹配 description 触发
```

### 进阶：带参数的命令

想做一个针对某个文件的深度 review？用 `$ARGUMENTS` 占位符：

```yaml
---
description: 对指定文件进行深度代码审查
disable-model-invocation: true
---

请对以下文件进行深度代码审查，关注安全性、性能和可维护性：

!`cat $ARGUMENTS`

文件路径：$ARGUMENTS
```

调用时：`/deep-review src/auth/login.ts`

## 实战 2：配置 Hooks 实现自动化

Hooks 是 Claude Code 的「生命周期钩子」——在特定事件发生时自动执行你定义的脚本。目前支持的事件非常丰富：

| 常用事件 | 触发时机 | 能否阻断 |
|----------|----------|----------|
| `PreToolUse` | 工具调用执行前 | ✅ 可以阻止执行 |
| `PostToolUse` | 工具调用成功后 | ❌ 但可追加上下文 |
| `Stop` | Claude 完成回复时 | ✅ 可以阻止停止 |
| `UserPromptSubmit` | 用户提交提示词后 | ✅ 可以拦截 |
| `SessionStart` | 会话启动或恢复时 | ❌ |
| `SubagentStop` | 子代理完成时 | ✅ 可以阻止停止 |

### 场景 A：自动格式化——写完即整理

每次 Claude 写完或编辑文件后，自动跑 Prettier：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write",
            "args": ["${tool_input.file_path}"]
          }
        ]
      }
    ]
  }
}
```

把这段加到 `.claude/settings.json` 里。`matcher` 指定只在 `Edit` 或 `Write` 工具执行后触发，`${tool_input.file_path}` 会自动替换成被编辑的文件路径。

### 场景 B：拦截危险的 rm 命令

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "echo '⛔ 检测到 rm 命令，已阻止执行' >&2 && exit 2"
          }
        ]
      }
    ]
  }
}
```

关键：**exit 2** 是 Claude Code hooks 的特殊退出码，表示「阻断操作」。exit 0 表示成功放行，其他退出码是非阻断的警告。

### 场景 C：完成前强制跑测试

用 `Stop` hook 在 Claude 完成任务前检查测试是否通过：

```bash
#!/bin/bash
# .claude/hooks/check-tests.sh
npm test --silent 2>&1
if [ $? -ne 0 ]; then
  echo '{"decision": "block", "reason": "测试未通过，请修复后再完成"}' 
  exit 2
fi
```

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/check-tests.sh"
          }
        ]
      }
    ]
  }
}
```

这样 Claude 每次想「收工」的时候都会先跑测试，没通过就继续修。

## Skills + Hooks 组合拳

最强的用法是把两者结合。举个例子——一个安全部署流程：

1. **Skill**：创建 `/deploy` 命令，包含部署步骤的提示词
2. **Hook**：在 Skill 的 frontmatter 中定义 `PreToolUse` hook，自动执行安全检查脚本
3. 只有当 Skill 激活时 hook 才生效，不会污染全局配置

```yaml
# .claude/skills/deploy/SKILL.md
---
description: 部署应用到生产环境
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---

按以下步骤部署：
1. 运行完整测试套件，确认全部通过
2. 构建生产版本
3. 执行数据库迁移（如有）
4. 部署到生产环境
5. 验证健康检查端点返回 200
```

注意这里 hooks 直接写在 Skill 的 frontmatter 里，**只在该 skill 激活时生效**——这种「局部 hook」的设计非常优雅，让你可以为不同流程定义专属的安全策略。

## 管理你的 Skills 和 Hooks

几个实用的管理技巧帮你维护日益增长的自动化配置：

- **查看已加载的 hooks**：在 Claude Code 中输入 `/hooks` 可以查看当前生效的所有 hook（只读）
- **紧急禁用所有 hooks**：在 settings.json 中设置 `"disableAllHooks": true`
- **Skill 优先级**：企业级 > 个人级 > 项目级，同名时高优先级覆盖低优先级
- **热更新**：修改 `SKILL.md` 后无需重启 Claude Code，它会自动检测文件变更并重新加载
- **兼容旧格式**：`.claude/commands/xxx.md` 仍然有效，但建议逐步迁移到 `.claude/skills/xxx/SKILL.md`，后者支持附带脚本、模板等辅助文件
- **Hook 配置层级**：`~/.claude/settings.json`（全局）、`.claude/settings.json`（项目级可提交）、`.claude/settings.local.json`（项目级不提交）

---

自定义 slash 命令和 hooks 是 Claude Code 最值得花时间折腾的功能——一次配置，长期受益。如果你在用 Conduit AI 接入 Claude Code，这些自动化流程同样完整可用，而且按量付费模式下用 hooks 减少不必要的来回对话还能帮你省 token。Conduit AI 作为统一 LLM 网关，一个 BASE URL 接入 Claude 与 GPT，约官方 1/8 的价格（省约 87%），HK$50 起充、送 HK$5，支持支付宝微信。

---

**相关阅读**：[Claude Code 快速入门指南](/conduit-blog/blog/claude-code-quickstart/) · [CLAUDE.md 配置指南](/conduit-blog/blog/claude-md-guide/) · [Claude Code 省 Token 技巧](/conduit-blog/blog/claude-code-save-tokens/)
