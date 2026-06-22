---
title: "Custom Slash Commands & Hooks in Claude Code — A Hands-On Guide"
description: "Learn how to build custom slash commands and hooks in Claude Code to automate repetitive workflows and turn multi-step operations into one-click actions."
pubDate: 2026-06-22
draft: false
tags: ["Claude Code", "slash commands", "hooks", "automation", "developer tools"]
keywords: ["Claude Code slash commands", "Claude Code hooks", "custom commands"]
---

## Why Custom Commands and Hooks Matter

If you've been using Claude Code for more than a week, you've probably noticed yourself typing the same prompts over and over. "Review this file for security issues." "Write tests for the function I just changed." "Summarize the diff before I commit." These repetitive workflows are exactly what custom slash commands and hooks were designed to eliminate.

Claude Code's extensibility system lets you define your own slash commands (triggered by typing `/your-command`) and hooks (scripts that run automatically at specific lifecycle points). Together, they turn Claude Code from a powerful assistant into a personalized development environment that knows *your* workflow.

In this guide, you'll build real commands and hooks from scratch — no theory-only fluff.

## Building Your First Custom Slash Command

Slash commands live as Markdown files inside your project's `.claude/commands/` directory (for project-scoped commands) or `~/.claude/commands/` (for global commands available everywhere). Each `.md` file becomes a command named after the file.

Let's start simple. Create a command that reviews the current diff for common issues:

```bash
mkdir -p .claude/commands
```

Now create `.claude/commands/review-diff.md`:

```markdown
Review the current git diff and check for:

1. Security issues (hardcoded secrets, SQL injection, XSS)
2. Performance problems (N+1 queries, unnecessary re-renders)
3. Missing error handling
4. Typos in user-facing strings

Format your response as a checklist. If everything looks good, say so briefly.
```

That's it. Next time you're in Claude Code, type `/review-diff` and it runs that prompt with your current context. No more retyping.

Here's a more advanced example — a command that generates a commit message following Conventional Commits. Create `.claude/commands/commit-msg.md`:

```markdown
Look at the staged changes (git diff --cached) and generate a commit message following Conventional Commits format:

<type>(<scope>): <description>

<body>

Rules:
- type: feat, fix, docs, style, refactor, test, chore
- scope: the module or file area affected
- description: imperative mood, lowercase, no period
- body: explain WHY, not WHAT (the diff shows what)

Output ONLY the commit message, nothing else.
```

### Commands with Arguments

Slash commands can accept arguments using the `$ARGUMENTS` placeholder. Create `.claude/commands/explain.md`:

```markdown
Explain the following code concept in the context of this project: $ARGUMENTS

- Use examples from the actual codebase where possible
- Keep it under 200 words
- Assume I'm a mid-level developer
```

Now `/explain dependency injection` passes "dependency injection" as the argument.

## Understanding Hooks: Automatic Triggers

While slash commands are things you invoke manually, hooks run automatically at specific points in Claude Code's lifecycle. They're configured in `.claude/settings.json` under the `hooks` key.

There are several hook points you can tap into:

| Hook Point | When It Fires | Common Use Case |
|---|---|---|
| `PreToolUse` | Before a tool executes | Validate or block dangerous operations |
| `PostToolUse` | After a tool executes | Log actions, run linters after file edits |
| `Notification` | When Claude sends a notification | Forward to Slack, play a sound |
| `Stop` | When Claude finishes a turn | Auto-run tests, show a summary |

Each hook runs a shell command and can influence Claude Code's behavior based on exit codes and output.

## Writing Your First Hook: Auto-Lint on Save

Let's build a hook that automatically runs ESLint whenever Claude Code edits a JavaScript or TypeScript file. Add this to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE_PATH\"; if [[ \"$FILE\" == *.ts || \"$FILE\" == *.js || \"$FILE\" == *.tsx || \"$FILE\" == *.jsx ]]; then npx eslint --fix \"$FILE\" 2>/dev/null; fi'"
      }
    ]
  }
}
```

The `matcher` field is a regex that filters which tools trigger the hook — here, it fires only when Claude uses the `Write` or `Edit` tools. The hook receives context through environment variables like `$CLAUDE_FILE_PATH`.

## Practical Hook Recipes

Here are battle-tested hooks you can drop into your projects today.

### Block Dangerous Git Operations

Prevent Claude from accidentally force-pushing or resetting your branch:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash -c 'if echo \"$CLAUDE_BASH_COMMAND\" | grep -qE \"git (push --force|reset --hard|clean -fd|branch -D)\"; then echo \"BLOCKED: Dangerous git operation detected\"; exit 2; fi'"
      }
    ]
  }
}
```

Exit code `2` tells Claude Code to block the operation entirely. Exit code `0` allows it.

### Auto-Format Python Files

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE_PATH\"; if [[ \"$FILE\" == *.py ]]; then black \"$FILE\" 2>/dev/null && isort \"$FILE\" 2>/dev/null; fi'"
      }
    ]
  }
}
```

### Send a Notification When a Long Task Completes

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "osascript -e 'display notification \"Claude Code finished your task\" with title \"Claude Code\"'"
      }
    ]
  }
}
```

(That's macOS-specific. On Linux, swap `osascript` for `notify-send`.)

## Combining Commands and Hooks for Power Workflows

The real magic happens when you combine both. Here's a workflow for test-driven development:

**Step 1**: Create `.claude/commands/tdd.md`:

```markdown
I want to do TDD for: $ARGUMENTS

1. First, write a failing test for the described behavior
2. Run the test to confirm it fails
3. Write the minimal implementation to make it pass
4. Run the test again to confirm it passes
5. Refactor if needed, keeping tests green

Use the project's existing test framework and patterns. Show me each step.
```

**Step 2**: Add a hook that runs the test suite whenever a test file is modified:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE_PATH\"; if [[ \"$FILE\" == *.test.* || \"$FILE\" == *.spec.* ]]; then echo \"Test file changed — auto-running tests...\"; npm test -- --bail 2>&1 | tail -20; fi'"
      }
    ]
  }
}
```

Now when you type `/tdd user authentication`, Claude writes a test, the hook auto-runs it (confirming it fails), Claude writes the implementation, and the hook auto-runs again (confirming it passes). The entire red-green-refactor cycle flows automatically.

## Tips for Maintaining Your Custom Setup

As your collection of commands and hooks grows, keep these practices in mind:

- **Version control your `.claude/` directory.** Your teammates benefit from shared commands like `/review-diff` or `/commit-msg`. Add personal-only commands to `~/.claude/commands/` instead.
- **Keep hooks fast.** Hooks run synchronously — a slow hook blocks Claude Code. If you need something heavy (like a full test suite), consider running it asynchronously or only on specific file patterns.
- **Use `settings.local.json` for personal hooks.** Project-level `settings.json` is shared; `settings.local.json` is gitignored and just for you.
- **Test hooks in isolation first.** Run the shell command manually with mock environment variables before wiring it into Claude Code. Debugging a hook that silently fails is painful.

```bash
# Test your hook command directly
CLAUDE_FILE_PATH="src/app.ts" bash -c 'FILE="$CLAUDE_FILE_PATH"; echo "Would lint: $FILE"'
```

- **Document your commands.** Add a comment block at the top of each `.md` file explaining when and why to use it. Future-you will appreciate it.

## What to Automate Next

Once you're comfortable, consider these high-value automations:

1. **Pre-commit review**: A hook that summarizes what Claude changed before you commit
2. **Changelog generation**: A slash command that reads recent commits and drafts release notes
3. **Dependency check**: A hook that flags when Claude adds a new npm/pip package so you can review it
4. **Context loading**: A slash command that reads your `CLAUDE.md`, recent PRs, and open issues to brief Claude before a session

Custom commands and hooks are one of those features that compound — the more you invest, the faster every future session becomes.

If you're running Claude Code through an API and want to keep costs low while experimenting with these workflows, check out **Conduit AI**. It gives you a single BASE URL that works with Claude and GPT models, with pay-as-you-go pricing at roughly 1/8 the official price — so you can iterate on your custom commands without worrying about the bill. Top up from HK$50, and you get HK$5 free credit to start.

---

**Related reading:**
- [Codex vs Cursor vs Claude Code — An Honest Comparison](/conduit-blog/en/blog/codex-vs-cursor-vs-claude/)
- [3 Ways to Use Top Models on a Budget](/conduit-blog/en/blog/low-cost-top-models/)
