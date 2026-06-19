---
title: "Claude Code 一键接入指南：从安装到第一次自动改代码"
description: "手把手教你安装并配置 Claude Code，完成第一次让 AI 自动改代码，并讲清 BASE URL / API key 的接入方式与常见报错排查。"
pubDate: 2026-06-19
tags: ["Claude Code", "AI教程", "入门"]
keywords: ["Claude Code 接入", "Claude Code 安装教程", "BASE URL 配置"]
draft: false
---

很多人第一次装 Claude Code，卡的不是用法，而是**接入**——key 怎么填、BASE URL 怎么配、为什么一跑就报错。这篇把流程一次讲清楚，跟着做 5 分钟就能让 AI 帮你自动改代码。

## 一、安装 Claude Code

Claude Code 是一个命令行工具，安装很简单：

```bash
npm install -g @anthropic-ai/claude-code
```

装完在终端输入 `claude --version` 能看到版本号，就说明装好了。

## 二、配置接入（关键一步）

Claude Code 需要两样东西才能工作：**一个 API key** 和 **一个 BASE URL**。

最常用的方式是把它们写进环境变量：

```bash
export ANTHROPIC_AUTH_TOKEN="你的key"
export ANTHROPIC_BASE_URL="你的接入地址"
```

> 小贴士：把这两行写进 `~/.zshrc` 或 `~/.bashrc`，以后开终端自动生效，不用每次手动 export。

## 三、第一次让 AI 自动改代码

进入任意一个项目目录，直接输入：

```bash
claude
```

然后用自然语言告诉它你要做什么，比如：

> 「帮我把 utils.js 里所有 var 改成 const，并加上简单注释。」

Claude Code 会读你的文件、提出改动、等你确认后自动写回。整个过程你只需要审阅和点确认。

## 四、常见报错排查

| 报错现象 | 多半原因 | 解法 |
|---|---|---|
| `401 Unauthorized` | key 错或没生效 | 检查 key 是否填对、环境变量是否 export |
| 连接超时 / 无响应 | BASE URL 配错或网络不通 | 核对 BASE URL 拼写、结尾不要多斜杠 |
| 模型不存在 | 模型名写错 | 用平台支持的模型名 |

## 小结

接入的本质就两件事：**填对 key、配对 BASE URL**。配好之后，Claude Code 就是个能读你代码、按指令自动改的助手。先从小改动练手，熟悉确认流程，再逐步交给它更大的任务。
