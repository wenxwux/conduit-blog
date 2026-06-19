---
title: "Same Task, 5 Models: Which Gives the Best Value"
description: "I ran the same coding and writing tasks across five LLMs to compare quality, speed, and cost. Here's how to think about value per dollar instead of raw benchmarks."
pubDate: 2026-06-19
tags: ["LLM", "Model Comparison", "Cost"]
keywords: ["best value LLM", "model comparison", "LLM cost vs quality", "which model to use"]
draft: false
---

"Which model is best?" is the wrong question. The right one is "best value *for this task*" — because the most capable model is overkill for half of what we actually ask it to do, and the cheapest one quietly fails on the other half. So instead of trusting leaderboards, I ran the same set of tasks across five models and looked at quality, speed, and cost together. Here's the framework and what I found.

## The setup

I used a fixed task suite that mirrors real work, not benchmark trivia:

- **Code:** implement a small feature from a spec, plus fix a bug given a stack trace.
- **Refactor:** clean up a messy 200-line file.
- **Reasoning:** a multi-step logic problem with a verifiable answer.
- **Writing:** rewrite a dense paragraph for clarity.
- **Extraction:** pull structured JSON from unstructured text.

Each task ran on five models spanning a flagship tier, a mid tier, and a small/cheap tier. I scored output quality 1–5 by hand, timed responses, and recorded token cost. I'm deliberately not publishing exact per-model numbers — they shift constantly and depend on your prompts — but the *patterns* are stable and that's what's useful.

## What "value" actually means

Value per dollar is the metric, not raw quality:

```
value = quality_score / cost_for_the_task
```

A flagship model scoring 5/5 at 8× the cost of a mid model scoring 4.5/5 is *worse value* for most tasks. You're paying a large premium for the last half-point — which only matters when that half-point is the difference between shipping and not.

## The patterns that held up

**1. On easy, structured tasks the tiers converge.**
Extraction and classification looked nearly identical across all five models — even the cheapest produced clean, correct JSON. Here, paying for the flagship is pure waste. The small model is the value winner by a mile.

**2. On hard reasoning the gap is real.**
The multi-step logic problem and the trickier bug fix separated the field. The flagship and strong mid models got it; the cheap models confidently produced wrong answers. This is exactly where the premium is justified — a wrong answer that *looks* right is the most expensive output there is.

**3. Mid-tier is the quiet value champion.**
Across drafting, refactoring, and standard coding, a good mid-tier model hit ~90% of flagship quality at a fraction of the price. For the bulk of day-to-day work, this is the sweet spot. I default here and escalate only when I hit something genuinely hard.

**4. Speed matters more than I expected.**
For interactive coding, a slightly-lower-quality but noticeably faster model often felt *better* to work with — tighter feedback loop, more iterations per minute. Latency is part of value when a human is in the loop.

## A decision table I actually use

| Task | Best-value pick | Reasoning |
|---|---|---|
| Classify / extract / route | Small/cheap | Quality converges; cost dominates |
| Draft, summarize, standard code | Mid | ~90% quality, big cost savings |
| Refactor a known file | Mid | Mechanical enough; save the premium |
| Hard bug / ambiguous design | Flagship | The half-point is worth it here |
| Interactive pair-coding | Fast mid | Loop speed beats marginal quality |

## How to run your own test (don't trust mine)

Models change monthly; the only comparison that matters is on *your* prompts. Do this:

1. Pick 5–10 tasks that represent your real workload.
2. Write the prompt once, run it across the candidate models unchanged.
3. Score quality blind (hide which model produced what).
4. Record cost and latency per task.
5. Compute `quality / cost` and look at it per task type, not overall.

The practical blocker is usually plumbing — different SDKs, keys, and endpoints per provider make A/B testing a pain. I run all five through one gateway with a single endpoint, so switching models is changing a string in the request. That turns "which model is best value" from a research project into a five-minute experiment you can re-run whenever a new model drops.

## The takeaway

There is no single best model — there's a best *fit* per task. The expensive mistake isn't picking the wrong flagship; it's sending easy, high-volume work to a flagship at all. Default to a strong mid-tier model, drop to cheap for structured tasks, and escalate to flagship only for the hard reasoning that earns the premium. Measure value per dollar on your own tasks, and re-measure when the models change — because they will.

Related reading: [Engineering Tricks to Cut LLM API Costs](/conduit-blog/en/blog/cut-llm-api-costs/)
