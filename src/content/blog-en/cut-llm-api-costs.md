---
title: "Engineering Tricks to Cut LLM API Costs: Caching, Batching, Model Picks"
description: "Concrete engineering tactics to lower your LLM API bill: prompt caching, request batching, smart model routing, and prompt slimming — with real before/after patterns."
pubDate: 2026-06-19
tags: ["LLM", "Cost Optimization", "API"]
keywords: ["cut LLM API costs", "prompt caching", "LLM batching", "model routing"]
draft: false
---

When an LLM feature goes from prototype to production, the bill stops being a rounding error. The good news: most of the spend is waste you can engineer away without touching quality. These are the four levers I reach for, in the order I reach for them, because they give the most savings for the least effort.

## 1. Prompt caching: stop paying for the same tokens

Most production prompts have a large, stable prefix — a system prompt, tool definitions, few-shot examples, a chunk of retrieved context — followed by a small variable part (the user's actual question). Without caching, you pay full input price for that whole prefix on every single call.

Prompt caching lets the provider store the prefix and charge a fraction for cache hits. The pattern:

- Put **everything stable at the front**: system instructions, schema, examples.
- Put the **variable user input at the end**.
- Mark the boundary so the prefix is cacheable.

```python
messages = [
    # --- cacheable prefix: identical across requests ---
    {"role": "system", "content": LONG_SYSTEM_PROMPT},   # 2k tokens
    {"role": "system", "content": TOOL_DEFINITIONS},      # 1k tokens
    {"role": "system", "content": FEW_SHOT_EXAMPLES},     # 3k tokens
    # --- variable suffix: changes every call ---
    {"role": "user", "content": user_question},           # 100 tokens
]
```

If you're serving the same agent to many users, that 6k-token prefix is the bulk of your input cost — and caching it is the single highest-leverage change you can make. The catch: caches expire, so caching only pays off when calls come close together. Bursty, high-volume traffic benefits most; one call an hour, less so.

## 2. Batching: trade latency for throughput

If your work isn't latency-sensitive — nightly summarization, bulk classification, embedding a backlog — don't fire requests one at a time at real-time prices. Batch APIs process many requests asynchronously at a steep discount.

Rule of thumb on what to batch:

- **Batch:** background jobs, data pipelines, evals, content generation queues, anything where "done within a few hours" is fine.
- **Don't batch:** chat, anything a user is waiting on.

Even without a dedicated batch API, you can group work: instead of one API call per item, ask the model to handle several items in a single call.

```python
# Instead of 50 calls...
for item in items:
    classify(item)

# ...one call that classifies 50 items
classify_batch(items)   # returns a JSON array of 50 labels
```

This cuts per-call overhead and lets the cacheable prefix be amortized across more useful output. Watch the output token limit and keep batch sizes sane so a single malformed response doesn't cost you the whole batch.

## 3. Model routing: don't send everything to the big model

The most common overspend I see: routing *every* request to the most capable (and most expensive) model. Most requests don't need it.

Tier your traffic:

| Task | Model tier | Why |
|---|---|---|
| Classification, extraction, routing | Small/cheap | Deterministic, easy, high volume |
| Drafting, summarizing, simple Q&A | Mid | Good enough, much cheaper |
| Hard reasoning, code architecture, ambiguous tasks | Large | Worth the price here |

A simple router goes a long way:

```python
def pick_model(task):
    if task.type in ("classify", "extract", "route"):
        return "small-model"
    if task.needs_deep_reasoning:
        return "large-model"
    return "mid-model"
```

You can also **cascade**: try the cheap model first, and only escalate to the expensive one when a confidence check or validation fails. For a workload where 80% of requests are easy, this alone can cut the bill dramatically. Routing through a single gateway makes this trivial — you swap a model name string, not an SDK or an endpoint.

## 4. Slim the prompt itself

Every token in, every token out, is money. Quick audit targets:

- **Bloated system prompts** — trim restated instructions and dead examples. Shorter often performs *better*, not worse.
- **Over-stuffed RAG context** — retrieve fewer, more relevant chunks instead of dumping ten documents. Re-rank and cut.
- **Uncapped output** — set `max_tokens` to what you actually need. A summarizer doesn't need 4k tokens of headroom.
- **Verbose formats** — ask for compact JSON, not prose-wrapped explanations you'll throw away.

## Putting it together

Stack the levers — they compound:

1. **Cache** the stable prefix (biggest single win for repeated prompts).
2. **Batch** everything that isn't user-facing.
3. **Route** easy tasks to cheap models, escalate only when needed.
4. **Trim** prompts and cap outputs so you're not paying for fluff.

In practice I start with caching and routing because they're the highest leverage for the least risk, then layer in batching for background jobs. None of this degrades quality — it just stops you paying full real-time price for work that doesn't need it. The cheapest token is the one you never send.

Related reading: [Same Task, 5 Models: Which Gives the Best Value](/conduit-blog/en/blog/best-value-model/)
