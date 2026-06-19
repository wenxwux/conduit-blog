---
title: "Claude Code 省 token 的 7 个实战技巧"
description: "用了几个月 Claude Code 后,我总结出 7 个真正能省 token 的实战技巧:从精简上下文到选对模型,帮你在不牺牲效果的前提下把消耗压下来。"
pubDate: 2026-06-19
tags: ["Claude Code", "省token", "实战技巧"]
keywords: ["Claude Code 省 token", "Claude Code token 优化", "节省 API 消耗"]
draft: false
---

用 Claude Code 写代码爽是真爽,但跑久了会发现:token 烧得也是真快。一个大项目里随便聊几轮,上下文就堆得老高。这篇是我自己实测下来确实有效的 7 个省 token 技巧,不靠玄学,每条都能立刻上手。

## 一、用 `/clear` 及时清上下文

这是最被忽略、也最有效的一招。Claude Code 默认会带着整段对话历史发请求,你聊得越久,每一轮要传的 token 越多——哪怕你后面问的是个不相关的新问题。

任务切换时,直接:

```bash
/clear
```

一个任务一段对话。我现在的习惯是:改完一个功能就清一次,绝不让无关历史一直挂着累积成本。

## 二、用 `.claudeignore` 屏蔽无关文件

Claude Code 读项目时会扫一堆文件,很多其实没必要喂给模型,比如依赖目录、构建产物、日志。建一个 `.claudeignore`(语法和 `.gitignore` 一样):

```
node_modules/
dist/
build/
*.log
.next/
coverage/
```

这样它扫描和检索时会自动跳过,既快又省。

## 三、明确指定要读的文件,别让它"全局搜索"

模糊的指令会触发大范围扫描。对比一下:

> ❌ "看看项目里登录是怎么实现的"
>
> ✅ "读 `src/auth/login.ts`,告诉我这个函数的逻辑"

第二种直接定位文件,省掉一大轮检索开销。你越清楚自己要改哪,token 花得越少。

## 四、写好 CLAUDE.md,减少重复解释

每次都要跟它说一遍"这个项目用 TypeScript、包管理用 pnpm、测试用 vitest"……这些重复说明可以一次性写进项目根目录的 `CLAUDE.md`。模型会自动读取,你就不用每轮重复交代背景了。

CLAUDE.md 怎么写更顺手,我单独写了一篇 [CLAUDE.md 怎么写才好用](/conduit-blog/blog/claude-md-guide/),可以配合看。

## 五、小任务用 Sonnet,别动不动上 Opus

不是所有任务都需要最强模型。日常的小改动、补注释、写测试,Sonnet 完全够用,而且单价低很多。真正需要复杂推理、大规模重构时再切 Opus。

切换很简单:

```bash
/model
```

选对模型本身就是最大的一笔省钱。具体怎么按场景选,可以看 [Opus vs Sonnet 怎么选](/conduit-blog/blog/opus-vs-sonnet/)。

## 六、长任务拆成小步,别一口气塞

一次性丢给它"把整个项目重构一遍",它会读海量文件、生成超长回复,token 爆炸还容易跑偏。拆成小步:

1. 先让它列出重构计划(只输出计划,不动代码)
2. 你确认后,一个模块一个模块地改
3. 每改完一个就 `/clear` 再开下一个

分步不仅省 token,质量也明显更稳。

## 七、善用缓存:重复的上下文别反复传

如果你在同一段对话里反复引用同一批文件,Claude 的提示词缓存机制会让重复部分变得很便宜。诀窍是**保持稳定的上下文结构**——把固定不变的背景信息放前面,变化的提问放后面,缓存命中率更高。

## 小结

省 token 的核心就一句话:**只给模型它真正需要的东西**。及时清历史、屏蔽无关文件、精确指定文件、选对模型、拆分大任务。这几招配合起来,我自己的日常消耗大概降了一半还多,效果几乎没打折。

---

**相关阅读**:[Opus 4.8 vs Sonnet 4.6 怎么选](/conduit-blog/blog/opus-vs-sonnet/) · [CLAUDE.md 怎么写才好用](/conduit-blog/blog/claude-md-guide/)
