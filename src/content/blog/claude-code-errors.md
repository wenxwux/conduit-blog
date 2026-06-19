---
title: "Claude Code 接入避坑:BASE URL / key 配置常见报错"
description: "Claude Code 接入时最容易卡在 BASE URL 和 key 的配置上。这篇汇总最常见的报错现象、原因和解法,照着排查基本都能解决。"
pubDate: 2026-06-19
tags: ["Claude Code", "接入", "报错排查"]
keywords: ["Claude Code 报错", "BASE URL 配置", "Claude Code key 配置"]
draft: false
---

装好 Claude Code,真正卡住人的往往不是怎么用,而是**接入**——key 填哪、BASE URL 怎么配、为什么一跑就报错。这篇把我遇到过、也被问到过最多的几个坑集中讲一遍,照着排查基本都能解决。

## 一、先搞清楚接入需要什么

Claude Code 工作只需要两样东西:

- **一个 API key**(身份凭证)
- **一个 BASE URL**(请求发到哪)

最常用的方式是写进环境变量:

```bash
export ANTHROPIC_AUTH_TOKEN="你的key"
export ANTHROPIC_BASE_URL="你的接入地址"
```

> 建议把这两行写进 `~/.zshrc` 或 `~/.bashrc`,改完执行 `source ~/.zshrc` 让它生效,以后开终端自动加载,不用每次手动 export。

## 二、常见报错一览

### 1. `401 Unauthorized`(认证失败)

最常见。基本就是 key 的问题:

- key 复制时多了空格或换行 → 重新干净地复制一遍
- 环境变量名写错 → 确认是 `ANTHROPIC_AUTH_TOKEN`
- 改了变量但没生效 → 重开终端,或 `source` 一下
- 验证一下到底有没有读到:

```bash
echo $ANTHROPIC_AUTH_TOKEN
```

输出为空就说明没设上。

### 2. 连接超时 / 无响应

通常是 BASE URL 的问题:

- 地址拼写错了 → 逐字符核对
- **结尾多了斜杠** → 这是高频坑,`https://xxx.com/` 末尾的 `/` 去掉试试
- 协议写成了 `http` → 一般要用 `https`
- 验证当前值:

```bash
echo $ANTHROPIC_BASE_URL
```

### 3. `404 Not Found`

多半是 BASE URL 的路径不对。注意 BASE URL 通常**只填到域名根**(或到 `/v1`,取决于你的接入说明),不要把完整的接口路径也写进去,Claude Code 会自动补后面的路径。

### 4. 模型不存在 / `model not found`

你指定的模型名,接入端不支持或拼错了。解决:

- 用接入方支持的标准模型名
- 在 Claude Code 里用 `/model` 看看可选项
- 检查有没有打错字(比如版本号写错)

### 5. 配置改了却没生效

这个坑太常见了,单独拎出来:

- 环境变量改完**必须重开终端或 source**,当前会话才会更新
- 如果你同时在多个地方配了(环境变量、配置文件),可能互相覆盖,留一处即可
- 实在乱了,把相关变量 `unset` 清掉重新设:

```bash
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_BASE_URL
```

然后重新 export。

## 三、一张排查速查表

| 报错现象 | 多半原因 | 解法 |
|---|---|---|
| 401 Unauthorized | key 错 / 没生效 | 重填 key,检查环境变量 |
| 连接超时 | BASE URL 错 / 多斜杠 | 核对地址,去掉结尾斜杠 |
| 404 Not Found | 路径写多了 | BASE URL 只填到根或 /v1 |
| model not found | 模型名错 | 用支持的模型名,`/model` 查看 |
| 改了没反应 | 没重载环境变量 | 重开终端或 source |

## 四、一个万能排查顺序

遇到任何接入报错,我都按这个顺序走,屡试不爽:

1. `echo` 确认 key 和 BASE URL **真的读到了**
2. 检查 BASE URL **结尾有没有多斜杠**、协议对不对
3. **重开终端**排除环境变量没生效
4. 换个最基础的指令试一下,缩小问题范围

## 小结

接入的本质就两件事:**填对 key、配对 BASE URL**。九成的报错都逃不出"key 没生效"和"BASE URL 写错"这两类。记住先 `echo` 验证、再查斜杠、最后重开终端,基本都能自己搞定。配好之后,Claude Code 就是个能读你代码、按指令自动改的好帮手。

---

**相关阅读**:[Claude Code 省 token 的 7 个实战技巧](/conduit-blog/blog/claude-code-save-tokens/) · [CLAUDE.md 怎么写才好用](/conduit-blog/blog/claude-md-guide/)
