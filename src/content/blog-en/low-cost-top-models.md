---
title: "3 Ways to Use Top Models on a Budget (Pay-As-You-Go, Model Pick, Fewer Tokens)"
description: "Three proven strategies to use top-tier AI models like Claude Opus and GPT-4o at roughly 1/8 the price — pay-as-you-go gateways, smart model selection, and token reduction techniques."
pubDate: 2026-06-22
draft: false
tags: ["cost optimization", "LLM", "pay-as-you-go", "budget", "token optimization"]
keywords: ["low cost AI", "save 87%", "pay as you go LLM"]
---

## The Problem: Top Models, Top Prices

You want Claude Opus for your hardest coding tasks. You want GPT-4o for your multimodal pipeline. You want Sonnet for your daily agentic workflows. But when you look at the bill — $150 here, $300 there — it stings.

Here's the thing: most developers overpay for AI by 5-10x. Not because the models are overpriced, but because of three fixable mistakes: paying retail when wholesale exists, using expensive models for cheap tasks, and sending way more tokens than necessary.

This article covers three concrete strategies that, combined, can cut your LLM costs by roughly 87%. No quality compromise. No sketchy workarounds. Just smarter spending.

## Strategy 1: Pay-As-You-Go Through API Gateways

### The Problem with Direct API Pricing

When you use Claude or GPT through their official APIs, you're paying retail:

| Model | Official Input Price | Official Output Price |
|---|---|---|
| Claude Opus 4 | $15.00 / 1M tokens | $75.00 / 1M tokens |
| Claude Sonnet 4 | $3.00 / 1M tokens | $15.00 / 1M tokens |
| Claude Haiku 3.5 | $0.80 / 1M tokens | $4.00 / 1M tokens |
| GPT-4o | $2.50 / 1M tokens | $10.00 / 1M tokens |

For a solo developer or small team, these prices add up fast. A heavy day of Claude Code usage (which uses Sonnet under the hood) can easily cost $20-50 in tokens.

### The Gateway Alternative

API gateways aggregate demand and negotiate bulk pricing, passing the savings on to you. The best ones offer:

- **Same models, same quality** — requests are proxied to the official API
- **Pay-as-you-go** — no monthly subscription, pay only for what you use
- **Significant discounts** — typically 60-87% below official pricing
- **Single endpoint** — one BASE URL for multiple providers (Claude + GPT)

Here's what the cost difference looks like in practice:

```python
# Direct Anthropic API
# Claude Sonnet, 100K input + 20K output tokens
cost_direct = (100_000 * 3.00 / 1_000_000) + (20_000 * 15.00 / 1_000_000)
# = $0.30 + $0.30 = $0.60 per session

# Via gateway at ~1/8 price
cost_gateway = 0.60 / 8
# ≈ $0.075 per session

# Over 30 days, 10 sessions/day:
monthly_direct = 0.60 * 10 * 30   # = $180
monthly_gateway = 0.075 * 10 * 30 # = $22.50

# Annual savings: ~$1,890
```

### Setting It Up

Switching to a gateway is typically a one-line configuration change:

```python
# Before: Direct API
import anthropic
client = anthropic.Anthropic(
    api_key="sk-ant-your-key"
)

# After: Via gateway (same SDK, different base URL)
client = anthropic.Anthropic(
    api_key="your-gateway-key",
    base_url="https://gateway.example.com/v1"
)
```

For tools like Claude Code and Cursor, it's usually an environment variable:

```bash
# Claude Code
export ANTHROPIC_BASE_URL="https://gateway.example.com"
export ANTHROPIC_API_KEY="your-gateway-key"

# Cursor: Settings → Models → API Base URL
```

Your code, prompts, and workflows stay exactly the same. The only change is where the request goes.

## Strategy 2: Smart Model Selection (Right Model, Right Task)

### Most Developers Over-Model

Here's a pattern I see constantly: a developer defaults to Sonnet or GPT-4o for *everything* because "it's good enough and I don't want to think about it." The result? They're paying 4-19x more than necessary for tasks that a cheaper model handles identically.

### The Model Routing Principle

Different tasks have fundamentally different intelligence requirements:

| Task Complexity | Appropriate Model | Relative Cost |
|---|---|---|
| Simple (classification, extraction, formatting) | Haiku / GPT-4o mini | 1x (baseline) |
| Medium (writing, code gen, analysis) | Sonnet / GPT-4o | 4-5x |
| Hard (architecture, debugging, research) | Sonnet + thinking | 8-10x |
| Hardest (security audit, novel algorithms) | Opus / o3 | 19-25x |

The key insight: **roughly 60-70% of typical API calls are "simple" tasks** that Haiku handles as well as Opus.

### Implementing a Model Router

Here's a practical router you can drop into any application:

```python
from enum import Enum

class TaskComplexity(Enum):
    SIMPLE = "simple"
    MEDIUM = "medium" 
    HARD = "hard"
    HARDEST = "hardest"

MODEL_MAP = {
    TaskComplexity.SIMPLE:  "claude-haiku-3-5-20241022",
    TaskComplexity.MEDIUM:  "claude-sonnet-4-20250514",
    TaskComplexity.HARD:    "claude-sonnet-4-20250514",  # + thinking
    TaskComplexity.HARDEST: "claude-opus-4-20250514",
}

def classify_task(task_description: str) -> TaskComplexity:
    """Simple rule-based router. Replace with LLM-based routing for complex apps."""
    
    simple_keywords = ["classify", "extract", "format", "translate", "categorize", 
                       "yes/no", "true/false", "summarize", "convert"]
    hard_keywords = ["debug", "architect", "security", "optimize", "design system",
                     "find the bug", "root cause"]
    hardest_keywords = ["audit", "vulnerability", "novel algorithm", "proof"]
    
    desc_lower = task_description.lower()
    
    if any(kw in desc_lower for kw in hardest_keywords):
        return TaskComplexity.HARDEST
    if any(kw in desc_lower for kw in hard_keywords):
        return TaskComplexity.HARD
    if any(kw in desc_lower for kw in simple_keywords):
        return TaskComplexity.SIMPLE
    return TaskComplexity.MEDIUM

def get_model_config(task_description: str) -> dict:
    complexity = classify_task(task_description)
    config = {
        "model": MODEL_MAP[complexity],
        "temperature": 0 if complexity == TaskComplexity.SIMPLE else 0.3,
        "max_tokens": 256 if complexity == TaskComplexity.SIMPLE else 2048,
    }
    
    if complexity == TaskComplexity.HARD:
        config["thinking"] = {"type": "enabled", "budget_tokens": 5000}
    
    return config
```

### Real Cost Impact

A startup processing 50,000 API calls/month with this routing:

| Approach | Monthly Cost |
|---|---|
| All Opus | ~$4,500 |
| All Sonnet | ~$900 |
| Smart routing (70% Haiku, 25% Sonnet, 5% Opus) | ~$270 |
| Smart routing + gateway pricing | ~$34 |

That's a 99% reduction from the "just use the best model" approach.

## Strategy 3: Send Fewer Tokens (Same Quality)

### Where Tokens Hide

Your token bill has two sides: input tokens (what you send) and output tokens (what you receive). Most developers focus on output but ignore input — where the bigger savings often are.

Hidden token sinks:

1. **System prompts repeated every call** — a 500-word system prompt costs tokens on every single message
2. **Full conversation history** — sending 50 messages of context when only the last 5 matter
3. **Uncompressed code** — sending an entire 2,000-line file when only 50 lines are relevant
4. **Verbose instructions** — telling the model what NOT to do in 10 different ways

### Technique 1: Trim Conversation History

```python
def trim_history(messages, max_messages=10, max_tokens_estimate=4000):
    """Keep conversation history manageable."""
    if len(messages) <= max_messages:
        return messages
    
    # Always keep the first message (sets context) and last N messages
    return [messages[0]] + messages[-(max_messages - 1):]
```

### Technique 2: Extract Only Relevant Code

```python
# BAD: Sending the entire file
with open("src/app.py") as f:
    prompt = f"Review this code:\n\n{f.read()}"  # 2000 lines = ~8000 tokens

# GOOD: Sending only the relevant function
prompt = f"""Review this function for bugs:

```python
{extract_function("src/app.py", "process_payment")}
```

Context: This function is called from the checkout endpoint in a Flask app.
"""
# ~200 lines = ~800 tokens (90% savings)
```

### Technique 3: Compress System Prompts

```python
# BLOATED: 800 tokens
system = """You are a customer support assistant for Acme Corp. 
You help customers with their questions about our products and services.
You should always be polite and professional. Never be rude to customers.
You should not make up information. Only answer based on the provided context.
If you don't know the answer, tell the customer you'll escalate to the team.
You should not discuss competitors. You should not discuss pricing unless asked.
...(continues for 20 more lines)"""

# COMPRESSED: 150 tokens (same behavior)
system = """Acme Corp support assistant. Rules:
- Answer from provided context only; escalate if unsure
- Professional tone, concise responses
- No competitor discussion; pricing only when asked"""
```

### Technique 4: Request Concise Output

```python
# The response will be shorter (fewer output tokens) with explicit length guidance
prompt = f"""Classify this ticket as: billing, technical, account, or other.
Reply with ONLY the category name, nothing else.

Ticket: {ticket_text}"""
```

### Combined Savings

| Optimization | Token Reduction | Cost Impact |
|---|---|---|
| Trim conversation history | 40-60% input reduction | -40% per multi-turn conversation |
| Extract relevant code only | 80-90% input reduction | -70% per code review call |
| Compress system prompts | 70-80% reduction | -5% overall (small per call, adds up) |
| Request concise output | 50-80% output reduction | -30% on output costs |

## The Combined Effect: All Three Strategies Together

Let's put it all together for a real scenario — a development team making 1,000 API calls per day:

| Strategy | Before | After | Savings |
|---|---|---|---|
| Baseline (all Sonnet, direct API) | $450/month | — | — |
| + API gateway (1/8 price) | — | $56/month | 87% |
| + Smart model routing | — | $22/month | 95% |
| + Token optimization | — | $14/month | 97% |

From $450 to $14. Same models. Same quality for every task. Just smarter spending.

## Getting Started Today

The fastest way to apply all three strategies:

1. **Switch to a pay-as-you-go gateway** — one config change, instant savings
2. **Audit your API calls** — log which model you're using for what, and identify tasks that don't need your most expensive model
3. **Check your token counts** — look at average input/output tokens per call and ask "is this all necessary?"

If you're ready to start with Strategy 1, **Conduit AI** is a unified LLM API gateway that gives you one BASE URL for both Claude and GPT models at roughly 1/8 the official price. It's pay-as-you-go with no subscription — top up from HK$50 and get HK$5 free credit. It works natively with Claude Code, Cursor, and Codex, so you can start saving in minutes without changing your workflow.

---

**Related reading:**
- [Every Claude Model in One Chart: Haiku to Opus Use Cases](/conduit-blog/en/blog/claude-models-overview/)
- [Build an AI Support Bot from Scratch — The Budget Way](/conduit-blog/en/blog/ai-support-bot-budget/)
