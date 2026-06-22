---
title: "10 Hidden Cursor Tricks That Boost Your Speed"
description: "Discover 10 overlooked Cursor IDE tips and tricks that will dramatically improve your coding speed without switching to a new tool."
pubDate: 2026-06-22
draft: false
tags: ["Cursor", "productivity", "IDE", "developer tools", "tips"]
keywords: ["Cursor tips", "Cursor productivity", "Cursor hidden features"]
---

## Beyond the Basics: Getting More from Cursor

You've installed Cursor, you've used Tab completion, you've chatted with the AI sidebar. Congratulations — you're using maybe 30% of what Cursor can do.

The real productivity gains come from the features buried in menus you never open, keyboard shortcuts you never memorized, and settings you never toggled. This article covers 10 tricks that daily Cursor users consistently overlook. None of them require plugins or extensions — they're all built in, waiting for you to discover them.

## 1. Use `.cursorrules` to Stop Repeating Yourself

Every time you tell Cursor "use TypeScript strict mode" or "follow our team's naming conventions," you're wasting keystrokes. Create a `.cursorrules` file in your project root:

```markdown
## Project conventions
- TypeScript strict mode, no `any` types
- React functional components only, use hooks
- CSS modules for styling, no inline styles
- Error messages must be user-friendly, no technical jargon
- All API calls go through the `src/lib/api` module
- Test files colocated with source: `Component.test.tsx`
```

Cursor reads this file automatically and applies these rules to every AI interaction. Your entire team can share it via version control.

## 2. Multi-File Edits with Composer

Most people use Cursor's chat for single-file questions. But Composer mode (`Cmd+I` / `Ctrl+I`) lets you make coordinated changes across multiple files in one shot.

The trick: **be explicit about which files to touch.** Instead of "add user authentication," try:

```
Add JWT authentication:
1. Create src/middleware/auth.ts with verify and decode functions
2. Update src/routes/api.ts to use the auth middleware
3. Add LOGIN and REGISTER handlers to src/routes/auth.ts
4. Create src/types/auth.ts for User and Token interfaces
```

Composer generates diffs for all four files simultaneously, and you can review and accept each one individually.

## 3. `@` Mentions for Precise Context

The `@` symbol in Cursor's chat is absurdly powerful, yet most people only use `@file`. Here's the full menu:

| Mention | What It Does | Best For |
|---|---|---|
| `@file` | Includes a specific file | "Fix the bug in @src/utils.ts" |
| `@folder` | Includes an entire directory | "Refactor everything in @src/components" |
| `@codebase` | Searches your whole repo | "Where is the database connection configured?" |
| `@web` | Searches the internet | "What's the latest React Router API?" |
| `@docs` | Searches documentation | "How does @docs Prisma handle migrations?" |
| `@git` | References git history | "What changed in the last 3 commits?" |

Stack them: "Using the patterns in @src/components/Button.tsx, create a new Dropdown component. Check @docs Radix UI for accessibility best practices."

## 4. Partial Accept with `Cmd+Right Arrow`

When Cursor suggests a multi-line completion, you don't have to accept all or nothing. Press `Cmd+Right Arrow` (Mac) or `Ctrl+Right Arrow` (Windows/Linux) to accept **word by word**. This is perfect when the suggestion is 80% right but you want to diverge halfway through.

You can also accept line by line for even more granular control. This gives you fine-grained editing without rejecting the entire suggestion and retyping from scratch.

## 5. Inline Editing with `Cmd+K`

You probably know `Cmd+K` opens the inline edit bar, but here are patterns that make it shine:

- **Select code first, then `Cmd+K`**: "Convert this to async/await" — transforms just the selection
- **Place cursor on a line, no selection, then `Cmd+K`**: "Add error handling" — generates code at that exact position
- **Select a function signature**: "Add JSDoc with parameter descriptions" — perfect for documentation

The key insight: `Cmd+K` is for surgical edits. Chat is for exploration. Composer is for multi-file orchestration. Using the right tool for each scale of change is what separates fast users from everyone else.

## 6. Custom AI Models via OpenAI-Compatible Endpoints

Cursor isn't locked to its bundled models. Go to **Settings, then Models** and add any OpenAI-compatible API endpoint. This means you can use:

- Local models via Ollama or LM Studio
- Custom fine-tuned models
- Third-party API gateways offering different pricing

```
# Example: Pointing Cursor to a custom endpoint
API Base URL: https://api.example.com/v1
API Key: sk-your-key-here
Model: claude-sonnet-4-20250514
```

This is especially useful when you want to control costs or use a specific model that Cursor doesn't offer natively. You keep Cursor's UI and workflow while routing requests wherever you want.

## 7. Terminal Integration: Run Commands from Chat

When you get a code suggestion in the chat panel that includes terminal commands, you don't need to copy-paste them. Use the "Run in Terminal" button to execute directly in Cursor's integrated terminal.

But the deeper trick is using the terminal the other direction: **select an error message in the terminal**, right-click, and choose "Send to Chat." Cursor gets the error with full context and can diagnose it immediately — no more manually copying stack traces.

## 8. Navigate with AI: Symbol Search on Steroids

Press `Cmd+Shift+P` and type "AI" to see all AI-enhanced navigation commands. The most underused one: **"Go to Related Code."**

Place your cursor on a function, trigger this command, and Cursor finds:

- Where this function is called
- Related test files
- Similar implementations elsewhere in the codebase
- Configuration that affects this code

It's like "Find References" but semantic rather than syntactic. It catches relationships that text search misses.

## 9. Checkpoint and Restore Conversations

Long Cursor chat sessions get unwieldy. Here's a pattern that keeps them productive:

1. Start a focused conversation: "We're refactoring the payment module."
2. After reaching a natural breakpoint, copy the summary into a new `.cursorrules` section or a `CONTEXT.md` file.
3. Start a fresh conversation referencing that file.

This beats one massive conversation because:
- Token usage stays low (faster and cheaper responses)
- Context stays relevant (no stale information from 200 messages ago)
- You can branch: start two conversations exploring different approaches from the same checkpoint

## 10. Keyboard Shortcuts You're Missing

Here's the shortcut cheat sheet that separates power users from casual users:

| Shortcut | Action |
|---|---|
| `Cmd+L` | Open chat with current file as context |
| `Cmd+I` | Open Composer for multi-file edits |
| `Cmd+K` | Inline edit at cursor position |
| `Cmd+Shift+L` | Add selection to chat context |
| `Cmd+Shift+K` | Generate code at cursor |
| `Cmd+.` | Quick fix with AI |
| `Tab` | Accept full suggestion |
| `Cmd+Right Arrow` | Accept word by word |
| `Escape` | Dismiss suggestion |

Print this. Stick it next to your monitor. After a week, most of these become muscle memory and you'll wonder how you coded without them.

## Putting It All Together

The trick to being fast in Cursor isn't learning one magic feature — it's building a workflow that chains these together. A typical power-user session looks like:

1. Open project with `.cursorrules` already set up (Trick 1)
2. Use `@codebase` to understand what you're working with (Trick 3)
3. Plan changes in Composer for multi-file edits (Trick 2)
4. Use `Cmd+K` for fine-tuned inline tweaks (Trick 5)
5. Partial-accept suggestions that are almost right (Trick 4)
6. Debug errors by sending terminal output to chat (Trick 7)

Each trick saves seconds. Over a full day of coding, seconds become hours. Over a year, you're shipping weeks ahead of where you'd otherwise be.

If you're using Cursor with a custom API endpoint (Trick 6), you might want to look at **Conduit AI** — it provides a single OpenAI-compatible BASE URL for both Claude and GPT models at pay-as-you-go pricing (around 1/8 the official price, saving you roughly 87%). No subscription needed — just top up from HK$50 and start coding. There's even HK$5 free credit to try it out.

---

**Related reading:**
- [Codex vs Cursor vs Claude Code — An Honest Comparison](/conduit-blog/en/blog/codex-vs-cursor-vs-claude/)
- [A Practical Guide to Tuning Temperature and max_tokens](/conduit-blog/en/blog/temperature-max-tokens-guide/)
