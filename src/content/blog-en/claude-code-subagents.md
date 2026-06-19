---
title: "Claude Code Subagents: Run Parallel Tasks End to End"
description: "Learn how Claude Code subagents work, when to spawn them, and how to run multiple coding tasks in parallel without context collisions or wasted tokens."
pubDate: 2026-06-19
tags: ["Claude Code", "Subagents", "Workflow"]
keywords: ["Claude Code subagents", "parallel tasks Claude Code", "subagent workflow"]
draft: false
---

The single biggest speedup I got out of Claude Code wasn't a faster model — it was learning to stop doing everything in one conversation. Subagents let you hand off self-contained chunks of work to separate agents that run with their own context window, then report back. Done right, you go from "babysitting one long thread" to "kicking off five tasks and reviewing the results."

Here's how I actually use them.

## What a subagent really is

A subagent is a fresh Claude Code instance spawned by the main agent. It gets its own context window, does one job, and returns a final summary — not the raw file dumps it read along the way. That last part matters: the parent only keeps the *conclusion*, so your main conversation stays clean even if the subagent read 40 files to get there.

Two properties make subagents worth the trouble:

- **Isolation** — a subagent's exploration doesn't pollute your main thread's context.
- **Parallelism** — independent subagents run concurrently, so wall-clock time drops.

## When to spawn one (and when not to)

Reach for a subagent when:

- The task is **read-heavy** — "find everywhere we call the old auth API" — and you only want the answer, not the search trail.
- You have **independent work** that can run side by side — e.g. write tests for module A *while* refactoring module B.
- You want a **specialized role** — a reviewer, an explorer, an architect — with its own instructions.

Don't bother when the task is a single known edit you could do in two tool calls. The overhead of spinning up an agent isn't worth it for trivial work.

## Running tasks in parallel

The key move: launch independent subagents **in one message**. If you send them one at a time, they queue. Sent together, they run concurrently.

A typical prompt I give the main agent:

> "Spawn three subagents in parallel: (1) explore how the payment flow works and report the call chain, (2) find all hardcoded timeouts in the repo, (3) draft unit tests for `utils/date.ts`. Report back when all three finish."

Each comes back with a tight summary. I review, then decide the next step. Crucially I never had to watch three searches scroll past — I got three conclusions.

## Giving subagents the right role

Generic subagents work, but specialized ones work better. In practice I lean on a few patterns:

| Role | Good for | What it returns |
|---|---|---|
| Explorer | Mapping unfamiliar code, "where is X" | A located answer + key file paths |
| Architect | Designing a feature before coding | A build plan with files to touch |
| Reviewer | Checking a diff for bugs | High-confidence issues only |
| Implementer | A scoped, well-defined change | The change, tested |

If your setup supports custom agent definitions, write a short instruction file per role so you don't re-explain the job every time. A reviewer agent that always "reports only high-confidence issues" saves you from wading through nitpicks.

## A real end-to-end example

Say I'm adding a feature flag system. Here's the flow I'd run:

1. **Architect subagent** — "Design a minimal feature-flag layer that fits our existing config pattern. Return files to create/modify and the data flow." I review the blueprint.
2. **Two implementer subagents in parallel** — one builds the flag store, one wires the React hook. They don't depend on each other's *files*, only on the shared interface the architect defined, so they run together.
3. **Reviewer subagent** — once both land, "review the diff for bugs and convention violations."
4. I do the final integration test myself.

What used to be a long, single-threaded afternoon becomes a few parallel bursts with me as the editor-in-chief.

## Things that bite people

- **Shared files = serialize them.** If two subagents edit the same file, run them sequentially or you'll get conflicts. Parallelism only helps when the work is genuinely independent.
- **Be specific in the handoff.** A subagent can't ask you a clarifying question mid-task the way the main thread can. Vague prompts produce vague summaries. Spell out the deliverable.
- **Don't re-run a search you delegated.** Once you hand a lookup to a subagent, wait for it — running it yourself too just doubles the token spend.
- **Watch token usage.** Many parallel agents on a big repo burn tokens fast. If you're routing through a unified gateway with pay-as-you-go billing, this is easy to keep an eye on; just don't fan out five agents for a one-line fix.

## Wrap-up

Subagents change how you *think* about a task: instead of one long conversation, you decompose work into isolated, parallelizable units and become the reviewer. Start small — delegate one read-heavy search and notice how much cleaner your main thread stays. Then try two parallel implementers on independent files. Once it clicks, you won't go back.

Related reading: [Claude Code Quickstart](/conduit-blog/en/blog/claude-code-quickstart/)
