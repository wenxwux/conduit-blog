---
title: "When Thinking Models Are Worth It — And When They Waste Money"
description: "A practical breakdown of when extended thinking and reasoning models justify their cost, and when you're just burning tokens on problems that don't need them."
pubDate: 2026-06-22
draft: false
tags: ["thinking models", "reasoning", "extended thinking", "cost optimization", "LLM"]
keywords: ["thinking model", "reasoning model cost", "extended thinking"]
---

## The Thinking Model Hype vs. Reality

"Just turn on extended thinking" has become the default advice for getting better AI output. And sure, reasoning models *are* impressive — watching Claude or GPT work through a complex problem step by step feels like magic.

But here's what nobody talks about: **thinking models roughly double your token costs**, and for a shocking number of tasks, the extra reasoning produces identical results to a standard model call. You're paying for a thinking process that adds nothing.

This article gives you a clear framework: when thinking tokens are a smart investment, when they're a pure waste, and how to set the budget so you get the benefit without the bloat.

## How Thinking Models Actually Work

When you enable extended thinking (Claude) or use a reasoning model (like o3), the model generates an internal chain-of-thought *before* producing its visible response. These "thinking tokens" are invisible in the final output but very visible on your bill.

Here's a concrete example:

```python
# Standard call — ~500 output tokens
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2048,
    messages=[{"role": "user", "content": "What's the capital of France?"}]
)
# Cost: ~500 tokens × $15/1M = $0.0075

# With extended thinking — 500 output + 2000 thinking tokens
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "What's the capital of France?"}]
)
# Cost: ~2500 tokens × $15/1M = $0.0375 (5x more for the same answer: "Paris")
```

The "capital of France" example is obviously silly, but developers make the equivalent mistake all the time with tasks like text formatting, data extraction, and simple classification.

## When Thinking Models Are Worth Every Token

### 1. Multi-Step Math and Logic

If the problem requires chaining multiple logical steps where an error in step 2 cascades through steps 3-7, thinking models dramatically improve accuracy.

```python
# WORTH IT: Complex calculation with dependencies
prompt = """
A company has 3 pricing tiers. Calculate the optimal price point 
for each tier given these constraints:
- Tier 1 must be ≤ 40% of Tier 3
- Tier 2 is the geometric mean of Tier 1 and Tier 3
- Total revenue across 1000/500/100 customers per tier must exceed $50,000
- Each tier must have a margin ≥ 30% given costs of $5/$15/$45
"""
```

Without thinking: the model often gets the geometric mean wrong or violates a constraint. With thinking: it works through each constraint systematically and self-corrects.

### 2. Complex Debugging

When a bug involves multiple interacting systems (database + cache + API + frontend), thinking models trace through the execution path more reliably.

```python
# WORTH IT: Multi-system debugging
prompt = """
Users report that updating their profile picture works on the first 
attempt but fails on subsequent attempts within the same session. 
Here's the relevant code from three services:
[... 200 lines of code across 3 microservices ...]
Find the bug.
"""
```

### 3. Code Architecture Decisions

When multiple valid approaches exist and you need the model to weigh trade-offs:

```python
# WORTH IT: Design decision with trade-offs
prompt = """
We need to add real-time notifications to our app. Consider:
- WebSockets vs SSE vs polling
- Our current infrastructure: Node.js, PostgreSQL, Redis, 3 app servers
- Expected load: 10K concurrent users, ~50 notifications/second total
- Must work behind our existing nginx load balancer
Recommend the architecture with specific implementation details.
"""
```

### 4. Security and Correctness-Critical Code

When a mistake could mean a vulnerability or data corruption:

```python
# WORTH IT: Security-sensitive code review
prompt = """
Review this authentication middleware for security vulnerabilities.
Consider OWASP Top 10, timing attacks, session fixation, and 
token handling edge cases.
[... code ...]
"""
```

## When Thinking Models Waste Money

### 1. Classification and Routing

If the answer is one of N predefined categories, thinking adds nothing:

```python
# WASTE: Simple classification
prompt = "Classify this support ticket as: billing, technical, account, other.\n\n" + ticket_text

# Standard model accuracy: ~95%
# Thinking model accuracy: ~95%
# Cost difference: 2-5x more for thinking
```

### 2. Text Extraction and Formatting

Pulling structured data from text is pattern matching, not reasoning:

```python
# WASTE: Data extraction
prompt = """Extract the following fields from this invoice as JSON:
- invoice_number, date, total, line_items
\n\n""" + invoice_text
```

### 3. Simple Code Generation

Boilerplate, CRUD operations, and well-known patterns don't need deep reasoning:

```python
# WASTE: Boilerplate generation
prompt = "Write a REST API endpoint in Express.js that creates a user with name, email, and password fields. Include input validation with Joi."
```

The model doesn't need to *think* about this — it's reproduced patterns like this millions of times.

### 4. Translation, Summarization, Rewriting

These are fundamentally transformation tasks, not reasoning tasks:

```python
# WASTE: Translation
prompt = "Translate this product description to Spanish:\n\n" + text

# WASTE: Summarization  
prompt = "Summarize this article in 3 bullet points:\n\n" + article
```

### 5. Creative Writing (Usually)

Counter-intuitive, but extended thinking can actually *hurt* creative output. The reasoning process tends to over-analyze and produce more formulaic results. Creative writing benefits from the model's intuitive pattern completion, not deliberate step-by-step reasoning.

## The Decision Matrix

| Task Type | Thinking Model? | Why |
|---|---|---|
| Math with multiple steps | ✅ Yes | Prevents cascade errors |
| Complex debugging | ✅ Yes | Traces execution paths |
| Architecture decisions | ✅ Yes | Weighs trade-offs systematically |
| Security review | ✅ Yes | Catches subtle vulnerabilities |
| Algorithm design | ✅ Yes | Explores solution space |
| Competitive analysis | ✅ Yes | Multi-factor comparison |
| Classification | ❌ No | Pattern matching, not reasoning |
| Data extraction | ❌ No | Structural, not logical |
| CRUD code | ❌ No | Well-known patterns |
| Translation | ❌ No | Transformation, not reasoning |
| Summarization | ❌ No | Compression, not reasoning |
| Creative writing | ❌ Usually no | Thinking makes it rigid |
| Simple Q&A | ❌ No | Direct recall suffices |

## Setting the Right Thinking Budget

When you do use extended thinking, don't just set `budget_tokens` to the maximum and hope for the best. The budget controls how much "scratchpad space" the model gets:

```python
# Too little — model can't finish reasoning, truncates mid-thought
thinking={"type": "enabled", "budget_tokens": 1000}

# Just right for most coding tasks
thinking={"type": "enabled", "budget_tokens": 5000}

# For genuinely hard problems (complex debugging, architecture)
thinking={"type": "enabled", "budget_tokens": 10000}

# Maximum — rarely needed, expensive
thinking={"type": "enabled", "budget_tokens": 32000}
```

**Rule of thumb**: start with `budget_tokens: 5000` and increase only if you see the thinking getting cut off or the answer quality is lower than expected. Most tasks that benefit from thinking need 3,000-8,000 thinking tokens.

## Implementing Smart Routing in Production

If you're building an application that makes many API calls, implement a simple router:

```python
def choose_model_and_thinking(task_type: str, complexity: str):
    """Route to the right model and thinking configuration."""
    
    # Simple tasks — no thinking needed
    if task_type in ["classify", "extract", "format", "translate"]:
        return {
            "model": "claude-haiku-3-5-20241022",
            "thinking": None
        }
    
    # Medium tasks — good model, no thinking
    if task_type in ["generate_code", "summarize", "write"]:
        return {
            "model": "claude-sonnet-4-20250514",
            "thinking": None
        }
    
    # Hard tasks — enable thinking
    if task_type in ["debug", "security_review", "architecture"]:
        budget = 10000 if complexity == "high" else 5000
        return {
            "model": "claude-sonnet-4-20250514",
            "thinking": {"type": "enabled", "budget_tokens": budget}
        }
    
    # Default
    return {"model": "claude-sonnet-4-20250514", "thinking": None}
```

## The Bottom Line: Think About Whether to Think

The meta-lesson here is straightforward: **apply the same cost-benefit analysis to your AI calls that you apply to your infrastructure.** You wouldn't spin up a GPU instance to serve a static website. Don't use thinking tokens to classify support tickets.

For the tasks that genuinely benefit — complex reasoning, debugging, architecture decisions — thinking models are one of the best investments in AI. For everything else, you're paying for a model to pretend to think about something it already knows.

The savings from smart model routing are significant. If you want to push those savings even further, **Conduit AI** offers all Claude models (including extended thinking) and GPT through a single BASE URL at approximately 1/8 the official price. Pay-as-you-go from HK$50, no subscription needed, and HK$5 free credit to start experimenting with the right model for each task.

---

**Related reading:**
- [Every Claude Model in One Chart: Haiku to Opus Use Cases](/conduit-blog/en/blog/claude-models-overview/)
- [A Practical Guide to Tuning Temperature & max_tokens](/conduit-blog/en/blog/temperature-max-tokens-guide/)
