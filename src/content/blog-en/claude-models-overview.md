---
title: "Every Claude Model in One Chart: Haiku to Opus Use Cases"
description: "A comprehensive comparison of all Claude models — from Haiku to Opus — with positioning, pricing tiers, and best-fit use cases to help you pick the right model every time."
pubDate: 2026-06-22
draft: false
tags: ["Claude", "AI models", "model comparison", "Anthropic", "LLM"]
keywords: ["Claude model comparison", "Claude models overview", "haiku vs opus"]
---

## Why Model Selection Matters More Than Prompt Engineering

Here's a costly mistake developers make every day: they pick the "best" Claude model for everything and then wonder why their API bill is ten times higher than expected. Or they pick the cheapest model and wonder why the output quality is garbage.

Choosing the right Claude model for the right task is the single highest-leverage optimization you can make. It's not unusual to cut costs by 90% — with zero quality loss — just by routing different tasks to different models. This guide gives you everything you need to make that call.

## The Complete Claude Model Lineup

As of mid-2026, Anthropic's Claude family has several active models across three tiers. Here's the full picture:

| Model | Tier | Context Window | Max Output | Input Price (per 1M tokens) | Output Price (per 1M tokens) | Speed | Intelligence |
|---|---|---|---|---|---|---|---|
| **Claude Opus 4** | Flagship | 200K | 32K | $15.00 | $75.00 | Slow | Highest |
| **Claude Sonnet 4** | Balanced | 200K | 64K | $3.00 | $15.00 | Medium | Very High |
| **Claude Haiku 3.5** | Speed | 200K | 8K | $0.80 | $4.00 | Fast | Good |

*Note: Prices are official Anthropic API rates. Third-party gateways may offer significant discounts.*

### Extended Thinking Models

Claude Sonnet and Opus also support extended thinking (reasoning mode), which uses additional "thinking tokens" for complex problem-solving:

| Model + Thinking | Thinking Token Input | Thinking Token Output | Best For |
|---|---|---|---|
| **Sonnet 4 (extended)** | $3.00/1M | $15.00/1M | Complex coding, math, multi-step reasoning |
| **Opus 4 (extended)** | $15.00/1M | $75.00/1M | Research-grade analysis, hardest problems |

Thinking tokens count toward your bill, so extended thinking roughly doubles your cost on reasoning-heavy tasks. Worth it for hard problems; wasteful for easy ones.

## Model Positioning: What Each One Is Built For

### Claude Haiku 3.5 — The Workhorse

Haiku is the model you should be using for 60-70% of your API calls. It's not "dumb" — it's *fast and efficient*. Haiku handles:

- **Classification and routing**: Is this email spam? Is this support ticket urgent?
- **Data extraction**: Pull structured data from unstructured text
- **Simple Q&A**: FAQ bots, knowledge base lookups
- **Text transformation**: Summarization, reformatting, translation
- **Code generation for simple patterns**: CRUD routes, boilerplate, test scaffolding

```python
# Perfect Haiku task: extracting structured data
response = client.messages.create(
    model="claude-haiku-3-5-20241022",
    max_tokens=256,
    messages=[{
        "role": "user",
        "content": f"Extract name, email, and company from this text. Return JSON only.\n\n{raw_text}"
    }]
)
```

Haiku typically responds in under 2 seconds and costs a fraction of Sonnet. For tasks where the answer is straightforward, there's simply no reason to use a more expensive model.

### Claude Sonnet 4 — The All-Rounder

Sonnet is the default choice for tasks that require genuine reasoning. It sits in the sweet spot of intelligence-per-dollar:

- **Complex code generation**: Architecture design, refactoring, debugging
- **Analysis and writing**: Technical docs, code reviews, detailed explanations
- **Multi-step reasoning**: "Given these constraints, what's the best approach?"
- **Agentic workflows**: Claude Code and similar autonomous tools default to Sonnet
- **Tool use and function calling**: Reliable structured output with tools

```python
# Ideal Sonnet task: code review with reasoning
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": f"Review this PR diff for bugs, security issues, and performance problems. Explain your reasoning.\n\n{diff}"
    }]
)
```

When you're unsure which model to use, Sonnet is almost always the safe bet. It's intelligent enough for hard tasks and affordable enough for regular use.

### Claude Opus 4 — The Heavy Hitter

Opus is for when you need the absolute best quality and cost is secondary. These are its sweet spots:

- **Research-grade analysis**: Complex data interpretation, literature review
- **Hardest coding problems**: System design, complex algorithms, subtle bugs
- **Long-form content**: Nuanced writing that requires maintaining coherence over thousands of words
- **Tasks where mistakes are costly**: Legal analysis, medical information, security audits
- **Sustained autonomous work**: Extended coding sessions that require deep understanding

```python
# Justify the Opus cost: a task where quality matters enormously
response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=8192,
    messages=[{
        "role": "user",
        "content": f"Perform a security audit of this authentication module. Identify all vulnerabilities, rank by severity, and provide specific fixes.\n\n{code}"
    }]
)
```

Opus costs 5x more than Sonnet per token. Use it when the cost of a wrong answer exceeds the cost of the API call.

## The Decision Flowchart

Use this mental model when choosing:

```
Is the task simple (classification, extraction, formatting)?
  → YES: Use Haiku
  → NO: Does it require genuine reasoning or creativity?
      → YES: Is perfection critical or is the problem extremely hard?
          → YES: Use Opus (with extended thinking if needed)
          → NO: Use Sonnet
      → NO: Use Haiku
```

## Real-World Routing: A Practical Example

Here's how a production application might route different tasks:

| Task | Model | Monthly Cost (100K calls) | Why |
|---|---|---|---|
| Classify support tickets | Haiku | ~$16 | Simple routing, speed matters |
| Generate email replies | Sonnet | ~$120 | Needs tone and context awareness |
| Summarize documents | Haiku | ~$32 | Extraction, not creation |
| Debug user-reported bugs | Sonnet + thinking | ~$200 | Requires multi-step reasoning |
| Security code review | Opus | ~$500 | Mistakes have high cost |
| Translate UI strings | Haiku | ~$12 | Straightforward transformation |
| Write API documentation | Sonnet | ~$180 | Quality writing + technical accuracy |

Total: ~$1,060/month using model routing vs. ~$4,200/month using Opus for everything. **That's a 75% savings with negligible quality difference** on the tasks routed to cheaper models.

## Prompt Adjustments by Model

Each model tier responds slightly differently to prompting:

**Haiku** benefits from:
- Extremely clear, structured instructions
- Few-shot examples (show it what you want)
- Limiting output format ("Return JSON only. No explanation.")

**Sonnet** benefits from:
- Context about the "why" behind the task
- Room to reason ("Think through this step by step")
- Moderate structure with flexibility

**Opus** benefits from:
- Rich context and background information
- Complex, nuanced instructions
- Freedom to explore and provide comprehensive answers

## When to Use Extended Thinking

Extended thinking (available on Sonnet and Opus) adds a "scratchpad" where the model reasons through the problem before responding. Enable it when:

- The problem has multiple valid approaches and you need the best one
- Math or logic is involved
- You're debugging and need the model to trace through code execution
- The task requires planning before execution

Skip it when:
- The answer is factual and doesn't require reasoning
- Speed matters more than depth
- The task is creative (extended thinking can make output more rigid)

```python
# Using extended thinking
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000
    },
    messages=[{
        "role": "user",
        "content": "Find the bug in this function and explain why it only fails on edge cases.\n\n" + code
    }]
)
```

## Key Takeaways

1. **Default to Haiku** for anything simple. Most developers under-use it.
2. **Reach for Sonnet** when reasoning matters. It's your daily driver for serious work.
3. **Reserve Opus** for high-stakes tasks where quality justifies 5x the cost.
4. **Use extended thinking selectively** — it's powerful but doubles token usage.
5. **Route by task**, not by habit. A mix of models always beats using one model for everything.

If you're routing across Claude models and want to keep costs low, **Conduit AI** can help. It gives you a unified API gateway where you access every Claude model (plus GPT) through one BASE URL at pay-as-you-go pricing — roughly 1/8 the official rate, saving about 87%. No subscription, top up from HK$50, and there's HK$5 free credit to get started.

---

**Related reading:**
- [When Thinking Models Are Worth It — And When They Waste Money](/conduit-blog/en/blog/thinking-model-worth-it/)
- [A Practical Guide to Tuning Temperature & max_tokens](/conduit-blog/en/blog/temperature-max-tokens-guide/)
