---
title: "A Practical Guide to Tuning Temperature & max_tokens"
description: "Learn how to tune temperature, max_tokens, top_p, and other LLM API parameters for better output quality, lower costs, and faster responses — with concrete examples."
pubDate: 2026-06-22
draft: false
tags: ["LLM", "API parameters", "temperature", "max_tokens", "optimization"]
keywords: ["temperature tuning", "max_tokens setting", "LLM parameter tuning"]
---

## The Parameters Most Developers Get Wrong

Every time you make an API call to Claude or GPT, you're sending a handful of parameters that quietly determine whether you get brilliant output or expensive garbage. Most developers leave these at defaults and never touch them. That's a mistake.

The three parameters that matter most are `temperature`, `max_tokens`, and `top_p`. Getting them right can improve output quality, cut costs by 30-50%, and speed up response times — all without changing a single word of your prompt. This guide shows you how.

## Temperature: The Creativity Dial

Temperature controls randomness in the model's token selection. Lower temperature = more deterministic and focused. Higher temperature = more creative and varied.

| Temperature | Behavior | Best For |
|---|---|---|
| 0.0 | Nearly deterministic — same input, same output | Code generation, data extraction, classification |
| 0.1 - 0.3 | Slight variation, still very focused | Technical writing, analysis, factual Q&A |
| 0.4 - 0.7 | Balanced creativity and coherence | General writing, brainstorming, conversation |
| 0.8 - 1.0 | Highly creative, more surprising choices | Creative writing, marketing copy, ideation |

### Temperature in Practice

Here's the same prompt at different temperatures:

```python
import anthropic
client = anthropic.Anthropic()

# Temperature 0: Deterministic, for code generation
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0,
    messages=[{
        "role": "user",
        "content": "Write a Python function to validate an email address using regex."
    }]
)
# Result: Clean, standard implementation. Same every time.

# Temperature 0.8: Creative, for brainstorming
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.8,
    messages=[{
        "role": "user",
        "content": "Suggest 5 creative names for a developer productivity tool."
    }]
)
# Result: Varied, surprising suggestions. Different each time.
```

### Common Temperature Mistakes

**Mistake 1: Using high temperature for code.** Temperature 0.7+ in code generation leads to syntactically valid but logically wrong code. The model gets "creative" with variable names, adds unnecessary abstractions, or invents APIs that don't exist.

```python
# BAD: High temperature for code
temperature=0.9  # Model might "creatively" use a non-existent method

# GOOD: Low temperature for code
temperature=0    # Model sticks to known, reliable patterns
```

**Mistake 2: Using temperature 0 for creative tasks.** You'll get flat, formulaic output. If you're generating marketing copy or brainstorming, you *want* some randomness.

**Mistake 3: Confusing temperature with intelligence.** Higher temperature doesn't make the model smarter — it makes it more willing to pick less-probable tokens. For hard reasoning tasks, temperature 0 is usually best because you want the highest-probability (most "confident") answer.

## max_tokens: Stop Paying for Output You Don't Need

`max_tokens` sets the upper limit on response length. This is the parameter with the most direct impact on both cost and quality.

### Why Lower Is Usually Better

Every output token costs money. If you're extracting a single number from a document, you don't need `max_tokens: 4096`. Set it to 64 and save 98% on output tokens.

```python
# WASTEFUL: Default max_tokens for a simple extraction
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,  # You're paying for buffer you'll never use
    messages=[{
        "role": "user",
        "content": "What is the total amount on this invoice?\n\n" + invoice_text
    }]
)
# Output: "$1,234.56" — uses ~10 tokens of the 4096 allowed

# OPTIMIZED: Right-sized max_tokens
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=64,  # Plenty for a number and brief context
    messages=[{
        "role": "user",
        "content": "What is the total amount on this invoice? Reply with just the number.\n\n" + invoice_text
    }]
)
```

*Note: You're charged for tokens actually generated, not the max_tokens value. But setting a lower max_tokens has two real benefits: it prevents the model from rambling (which costs real tokens), and it forces concise output.*

### Right-Sizing max_tokens by Task

| Task | Recommended max_tokens | Why |
|---|---|---|
| Yes/no classification | 8-16 | One word answer |
| Data extraction (JSON) | 128-512 | Structured, predictable size |
| Short answer Q&A | 256-512 | A paragraph at most |
| Code function | 512-2048 | Depends on function complexity |
| Blog article | 2048-4096 | Long-form content |
| Full code file | 4096-8192 | Large output needed |
| Extended analysis | 4096-16000 | Detailed multi-section response |

### The Truncation Trap

If `max_tokens` is too low, the model's response gets cut off mid-sentence. This wastes the entire call — you've paid for a partial, unusable response. The fix:

```python
# Check if the response was truncated
if response.stop_reason == "max_tokens":
    # Response was cut off — increase max_tokens and retry
    print("Warning: Response truncated. Consider increasing max_tokens.")
```

**Strategy**: Start with a conservative `max_tokens`, check for truncation, and increase only if needed. This is better than always setting it high "just in case."

## top_p: The Parameter You Should (Mostly) Ignore

`top_p` (nucleus sampling) controls which tokens the model considers. A `top_p` of 0.9 means the model only considers tokens in the top 90% of probability mass.

Here's the honest truth: **for most use cases, you should leave `top_p` at its default (usually 1.0) and only adjust temperature.** The two parameters do similar things, and adjusting both creates unpredictable interactions.

```python
# SIMPLE: Just use temperature
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.3,
    # top_p left at default
    messages=[{"role": "user", "content": prompt}]
)

# COMPLICATED (and rarely better): Adjusting both
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.7,
    top_p=0.9,  # Now you're tuning two correlated knobs
    messages=[{"role": "user", "content": prompt}]
)
```

The exception: if you need to eliminate truly bizarre outputs while keeping some creativity, `top_p=0.95` with a moderate temperature can help. But this is an edge case.

## Putting It All Together: Parameter Recipes

Here are ready-to-use parameter combinations for common tasks:

### Recipe 1: Code Generation

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0,
    "max_tokens": 2048,
    # No top_p override
}
```

### Recipe 2: JSON Data Extraction

```python
{
    "model": "claude-haiku-3-5-20241022",
    "temperature": 0,
    "max_tokens": 512,
}
```

### Recipe 3: Customer Support Bot

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.3,
    "max_tokens": 1024,
}
```

### Recipe 4: Creative Marketing Copy

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.8,
    "max_tokens": 2048,
}
```

### Recipe 5: Technical Documentation

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.1,
    "max_tokens": 4096,
}
```

### Recipe 6: Brainstorming Session

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.9,
    "max_tokens": 2048,
}
```

## The Cost Impact: A Real Example

Let's compare a poorly-tuned vs. well-tuned API call for a support ticket classifier processing 10,000 tickets per day:

**Before optimization:**
```python
# Using Sonnet, high max_tokens, default temperature
model = "claude-sonnet-4-20250514"
max_tokens = 4096
temperature = 0.7
# Average output: ~200 tokens (wasted buffer, sometimes rambles)
# Daily cost: 10,000 × 200 tokens × $15/1M = $30/day
```

**After optimization:**
```python
# Using Haiku, tight max_tokens, zero temperature
model = "claude-haiku-3-5-20241022"
max_tokens = 32
temperature = 0
# Average output: ~8 tokens (just the category)
# Daily cost: 10,000 × 8 tokens × $4/1M = $0.32/day
```

That's a **99% cost reduction** with the same classification accuracy. The optimized version is also faster because shorter outputs complete sooner.

## Advanced: Dynamic Parameter Adjustment

For production applications, consider adjusting parameters dynamically based on the task:

```python
def get_params(task_type: str) -> dict:
    configs = {
        "classify": {"model": "claude-haiku-3-5-20241022", "temperature": 0, "max_tokens": 32},
        "extract":  {"model": "claude-haiku-3-5-20241022", "temperature": 0, "max_tokens": 512},
        "answer":   {"model": "claude-sonnet-4-20250514", "temperature": 0.2, "max_tokens": 1024},
        "write":    {"model": "claude-sonnet-4-20250514", "temperature": 0.6, "max_tokens": 4096},
        "create":   {"model": "claude-sonnet-4-20250514", "temperature": 0.8, "max_tokens": 2048},
    }
    return configs.get(task_type, configs["answer"])

# Usage
params = get_params("classify")
response = client.messages.create(
    messages=[{"role": "user", "content": prompt}],
    **params
)
```

## Key Takeaways

1. **Temperature 0** for code, extraction, and anything with a "right answer." Save creativity for creative tasks.
2. **Right-size max_tokens** for each task. Don't leave 4096 as the default everywhere.
3. **Leave top_p alone** unless you have a specific reason to change it.
4. **Match the model to the task** — parameter tuning can't make Haiku do Opus's job, but it can make sure you're not using Opus where Haiku suffices.
5. **Monitor and iterate** — log your actual output token counts and adjust max_tokens accordingly.

These optimizations apply whether you're calling the API directly, using Claude Code, or building with any LLM framework. And if you want to save further on the API costs themselves, **Conduit AI** offers a unified gateway for Claude and GPT models at roughly 1/8 the official price (~87% savings). Pay-as-you-go with no subscription — top up from HK$50 and get HK$5 free credit. It works with any tool that accepts an OpenAI-compatible BASE URL.

---

**Related reading:**
- [Every Claude Model in One Chart: Haiku to Opus Use Cases](/conduit-blog/en/blog/claude-models-overview/)
- [When Thinking Models Are Worth It — And When They Waste Money](/conduit-blog/en/blog/thinking-model-worth-it/)
