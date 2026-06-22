---
title: "temperature / max_tokens 实战调参指南：别再用默认值了"
description: "面向调 API 的开发者，讲清 temperature、max_tokens、top_p 等核心参数怎么调，附不同场景推荐值速查表。"
pubDate: 2026-06-22
draft: false
tags: ["LLM 参数", "temperature", "max_tokens", "调参", "API"]
keywords: ["temperature 调参", "max_tokens 设置", "LLM 参数调优", "top_p", "API 调参指南"]
---

## 为什么默认参数不够用

很多开发者调 LLM API 时，参数一律用默认值——temperature 不设、max_tokens 拉满。结果要么生成的内容太"正经"缺乏创意，要么太"放飞"胡说八道，或者每次请求都消耗大量不必要的 token。

LLM 的核心参数就那么几个，但调好了能让同一个模型在不同场景的表现判若两人。这篇文章帮你把最重要的参数吃透，给出可直接抄作业的推荐值。

## 核心参数详解

### temperature：控制"创造力"

`temperature` 控制模型输出的随机性，取值范围通常是 0 到 1（部分 API 允许到 2）。

- **temperature = 0**：每次都选概率最高的 token，输出几乎确定性。适合需要精确、一致的任务。
- **temperature = 0.5-0.7**：在确定性和多样性之间取平衡，是大多数通用任务的甜区。
- **temperature = 1.0+**：输出更随机、更有"创意"，但也更容易跑偏。

```python
import anthropic

client = anthropic.Anthropic()

# 精确分类任务：temperature 设低
classification = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=20,
    temperature=0,  # 要确定性结果
    messages=[{
        "role": "user",
        "content": "将这条评论分类为 [正面/负面/中性]：'这家店的服务还行，但菜太贵了'"
    }]
)

# 创意写作：temperature 适当拉高
creative = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=500,
    temperature=0.9,  # 要多样性和创意
    messages=[{
        "role": "user",
        "content": "用一个比喻来描述清晨的城市"
    }]
)
```

### max_tokens：控制输出长度

`max_tokens` 设置模型最多输出多少个 token。这个参数直接影响成本和响应时间。

**常见误区**：很多人把 max_tokens 设成 4096 甚至更高"以防万一"。问题是：

1. 模型可能真的生成那么长的内容，造成不必要的开销
2. 响应时间会变长（更多 token = 更多生成时间）
3. 对于分类、提取这类任务，输出只需要几个字

**实操建议**：根据预期输出长度设置，留 20-30% 的余量即可。

| 任务类型 | 预期输出 | 推荐 max_tokens |
|---------|---------|----------------|
| 分类/标签 | 1-5 个字 | 20-50 |
| 实体提取 | 一段 JSON | 200-500 |
| 摘要 | 一段话 | 300-600 |
| 代码生成 | 一个函数 | 500-1500 |
| 长文写作 | 多段落 | 2000-4096 |
| 翻译 | 与原文等长 | 原文 token 数 × 1.3 |

### top_p：另一种随机性控制

`top_p`（nucleus sampling）从另一个角度控制随机性：它限制模型只从概率累加到 p 的 token 集合中采样。

- **top_p = 0.1**：只从最可能的几个 token 中选，非常保守
- **top_p = 0.9**：从绝大多数合理 token 中选，比较开放
- **top_p = 1.0**：不做限制（默认值）

**重要提醒**：一般不建议同时调 temperature 和 top_p。选一个调就好：

- 需要精确控制 → 调 temperature
- 需要限制"离谱输出" → 调 top_p

```python
# 代码生成：用 top_p 限制，避免生成语法错误的奇怪 token
code_response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1000,
    temperature=0.3,
    top_p=0.9,  # 排除那些概率极低的离谱选项
    messages=[{
        "role": "user",
        "content": "用 Python 写一个 LRU Cache 类"
    }]
)
```

## 场景速查表：直接抄作业

下面是不同场景的推荐参数组合，可以直接拿来用：

| 场景 | temperature | max_tokens | top_p | 说明 |
|------|------------|-----------|-------|------|
| 文本分类 | 0 | 20-50 | 1.0 | 要确定性，输出极短 |
| JSON 提取 | 0 | 200-800 | 1.0 | 格式必须精确 |
| 代码生成 | 0.2-0.3 | 500-2000 | 0.95 | 略带灵活性，但别跑偏 |
| 翻译 | 0.1-0.3 | 源文×1.3 | 1.0 | 忠于原文，略有润色空间 |
| 对话/聊天 | 0.5-0.7 | 500-1000 | 1.0 | 自然流畅，不死板 |
| 创意写作 | 0.8-1.0 | 1000-4096 | 1.0 | 鼓励多样表达 |
| 数据分析总结 | 0.1-0.2 | 500-1500 | 1.0 | 准确为先 |
| 头脑风暴 | 0.9-1.0 | 1000-2000 | 1.0 | 越发散越好 |
| 客服回复 | 0.3-0.5 | 300-800 | 1.0 | 专业但不机械 |

## 调参实战：三步法

### 第一步：从保守值开始

不确定怎么调？先用低 temperature（0.2）+ 合理 max_tokens 跑几次，看看基础效果。

### 第二步：根据问题方向调整

- 输出太死板、千篇一律 → 提高 temperature（每次 +0.1）
- 输出跑偏、出现幻觉 → 降低 temperature
- 输出被截断 → 增加 max_tokens
- 输出太啰嗦 → 减少 max_tokens，同时在 prompt 里加"简洁回答"

### 第三步：A/B 测试固化

找到一组看起来不错的参数后，用 20-50 条真实输入做 A/B 测试，对比不同参数组合的输出质量，然后固定下来。

```python
# 简单的参数对比测试框架
import json

test_cases = [
    "用一句话解释量子计算",
    "写一封拒绝加班的邮件",
    "解释为什么天是蓝色的",
]

configs = [
    {"temperature": 0.3, "max_tokens": 500},
    {"temperature": 0.7, "max_tokens": 500},
    {"temperature": 1.0, "max_tokens": 500},
]

results = []
for case in test_cases:
    for config in configs:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": case}],
            **config,
        )
        results.append({
            "input": case,
            "config": config,
            "output": response.content[0].text,
        })

# 将结果保存下来人工评估
with open("param_test_results.json", "w") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
```

## 容易踩的坑

1. **max_tokens 不等于输出长度**：模型可能在达到 max_tokens 之前就自然结束。max_tokens 只是上限，不是"请你写这么长"。
2. **temperature=0 不代表 100% 一致**：由于浮点精度等因素，极少数情况下 temperature=0 也可能有微小差异，不要依赖它做哈希级一致性校验。
3. **不要用 temperature 替代 prompt 工程**：如果输出质量有问题，先改 prompt。参数调优是锦上添花，不是雪中送炭。
4. **流式输出时 max_tokens 同样重要**：即使用 streaming，max_tokens 仍然限制总量，别以为流式就不用管了。

## 写在最后

参数调优看似琐碎，但它是"同样的 prompt、同样的模型，效果差一大截"的关键变量之一。花 10 分钟把参数调对，可能比花 2 小时改 prompt 更有效。

如果你在调试不同模型的参数时，不想分别管理 OpenAI 和 Anthropic 的 API，可以看看 **Conduit AI**。它提供统一 LLM 网关，一个 BASE URL 接入 Claude 和 GPT 全系列，按量付费无订阅，价格约为官方 1/8（省约 87%），HK$50 起充送 HK$5，支持支付宝和微信支付。调参的时候可以随时切换模型对比效果，不用换 API Key。

---

### 相关阅读

- [Claude 全系列模型一张图看懂：从 Haiku 到 Opus 怎么选](/conduit-blog/blog/claude-models-overview/)
- [thinking 模型什么时候值得用、什么时候纯烧钱](/conduit-blog/blog/thinking-model-worth-it/)
- [从 0 搭一个 AI 客服机器人：最省钱方案](/conduit-blog/blog/ai-support-bot-budget/)
