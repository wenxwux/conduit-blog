---
title: "Build an Automated Code Review Workflow with Codex"
description: "A practical guide to setting up automated code review with Codex: pre-commit checks, CI integration, review prompts, and how to keep signal high and noise low."
pubDate: 2026-06-19
tags: ["Codex", "Code Review", "Automation"]
keywords: ["Codex code review", "automated code review", "Codex CI workflow"]
draft: false
---

Manual code review is valuable but slow, and reviewers are tired. The fix isn't to replace humans — it's to put an AI pass in front of them so the obvious stuff (silent failures, missed edge cases, convention drift) gets caught before a person ever looks. I've been running Codex as that first-pass reviewer for a while. Here's the setup that actually holds up.

## The goal: a two-stage review

The mental model I use:

1. **Stage 1 — Codex** catches mechanical and pattern-level issues automatically on every change.
2. **Stage 2 — a human** focuses on design, intent, and the judgment calls AI is bad at.

The point of stage 1 is to make stage 2 *cheaper*, not to remove it. If Codex flags ten things and eight are real, your human reviewer starts from a much better place.

## Step 1: A local pre-commit pass

The earliest you can catch a problem is before it's even committed. I wire Codex into a pre-commit step that reviews the staged diff.

```bash
# .git/hooks/pre-commit (or via a hook manager)
#!/usr/bin/env bash
DIFF=$(git diff --cached)
if [ -z "$DIFF" ]; then exit 0; fi

echo "$DIFF" | codex review --stdin \
  --focus "bugs,silent-failures,edge-cases" \
  --format markdown > /tmp/codex-review.md

echo "--- Codex review ---"
cat /tmp/codex-review.md
```

I keep this **non-blocking** by default — it prints findings but doesn't reject the commit. A blocking gate that fires on false positives trains people to bypass it, which defeats the purpose.

## Step 2: A focused review prompt

The quality of the review is mostly the quality of the prompt. A vague "review this code" gets you vague output. I give Codex a tight rubric:

> Review this diff. Report only issues you are confident about. For each, give: file and line, severity (high/medium/low), the problem in one sentence, and a concrete fix. Prioritize: silent failures and swallowed errors, missing error handling, edge cases (null/empty/boundary), and violations of the project's existing conventions. Do **not** comment on style the formatter already handles. If the diff is clean, say so.

That last instruction matters — telling it to stay quiet when there's nothing to say is what keeps the noise down.

## Step 3: Wire it into CI

Local hooks help, but CI is where it becomes a team habit. On every pull request I run a review job and post the result as a PR comment.

```yaml
# .github/workflows/codex-review.yml
name: Codex Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Run Codex review
        env:
          OPENAI_BASE_URL: ${{ secrets.LLM_BASE_URL }}
          OPENAI_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > pr.diff
          codex review --stdin < pr.diff --format markdown > review.md
      - name: Post comment
        run: gh pr comment ${{ github.event.number }} --body-file review.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

A few notes from running this in practice:

- I point `OPENAI_BASE_URL` at a single gateway endpoint so the same secret works across local hooks and CI, and so I can swap the underlying model without touching the workflow.
- `fetch-depth: 0` matters — you need full history to diff against the base branch.
- Keep the review scoped to the **diff**, not the whole repo. Reviewing unchanged code wastes tokens and buries the real findings.

## Step 4: Tune for signal

The first week you'll get too many low-value comments. Tighten it:

| Symptom | Fix |
|---|---|
| Too many nitpicks | Add "ignore anything the linter/formatter covers" |
| Flags things already intentional | Feed it the relevant convention/CLAUDE.md context |
| Misses real bugs | Add explicit categories (concurrency, off-by-one, resource leaks) |
| Comment too long to read | Cap output: "max 8 findings, highest severity first" |

The dial you're turning is **confidence threshold**. Tell it to only report high-confidence issues and you trade a few missed minor things for a comment your team will actually read.

## What to let humans keep

I never let the AI pass make the merge decision. Codex is great at: swallowed exceptions, unhandled nulls, copy-paste bugs, inconsistent error handling, missing test cases. It's weak at: whether the feature is the *right* feature, whether the abstraction will age well, and whether a change matches unspoken team context. That's the reviewer's job, and now they have the energy for it because the mechanical pass already ran.

## Wrap-up

The win here isn't "AI reviews my code" — it's a layered pipeline: pre-commit catches the obvious, CI makes it a team norm, and humans spend their attention where it counts. Start with the non-blocking local hook, get the prompt tuned, then promote it to CI once the signal is good. Within a couple weeks the AI pass becomes invisible infrastructure — and your PRs get cleaner before anyone opens them.

Related reading: [Claude Code Subagents: Run Parallel Tasks End to End](/conduit-blog/en/blog/claude-code-subagents/)
