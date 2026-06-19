---
title: "Claude Code Quickstart: From Install to Your First AI Code Edit"
description: "A hands-on guide to installing and configuring Claude Code, making your first AI-powered code edit, and setting up BASE URL / API key with common error fixes."
pubDate: 2026-06-19
tags: ["Claude Code", "Tutorial", "Getting Started"]
keywords: ["Claude Code setup", "Claude Code tutorial", "BASE URL config"]
draft: false
---

For most people, the hard part of starting with Claude Code isn't *using* it — it's **getting it connected**: where the key goes, how to set the BASE URL, and why it errors on the first run. This guide walks through the whole flow so you can have AI editing your code in about 5 minutes.

## 1. Install Claude Code

Claude Code is a CLI tool. Installing it is one command:

```bash
npm install -g @anthropic-ai/claude-code
```

Run `claude --version` afterwards — if you see a version number, you're good.

## 2. Configure access (the key step)

Claude Code needs two things to work: an **API key** and a **BASE URL**.

The most common setup is environment variables:

```bash
export ANTHROPIC_AUTH_TOKEN="your-key"
export ANTHROPIC_BASE_URL="your-endpoint-url"
```

> Tip: add these two lines to `~/.zshrc` or `~/.bashrc` so they load automatically in every new terminal.

## 3. Your first AI code edit

Go into any project directory and run:

```bash
claude
```

Then describe what you want in plain language, for example:

> "In utils.js, change every `var` to `const` and add short comments."

Claude Code reads your files, proposes the changes, and writes them back after you confirm. Your job is just to review and approve.

## 4. Common errors

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 Unauthorized` | Wrong or unset key | Check the key value and that the env var is exported |
| Timeout / no response | Wrong BASE URL or network issue | Verify the URL spelling; no trailing slash |
| Model not found | Wrong model name | Use a model name your provider supports |

## Wrap-up

Connecting really comes down to two things: **the right key** and **the right BASE URL**. Once those are set, Claude Code is an assistant that reads your code and edits it on command. Start with small changes to get used to the confirm flow, then hand it bigger tasks.

---

If you want Claude (and GPT, and more) through a single endpoint, **Conduit AI** is a unified LLM API gateway — one BASE URL, pay-as-you-go (~1/8 of official price), no subscription. It works out of the box with Claude Code: just point `ANTHROPIC_BASE_URL` at it.
