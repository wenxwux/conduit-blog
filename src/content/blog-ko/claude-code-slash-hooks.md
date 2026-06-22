---
title: "Claude Code 커스텀 슬래시 명령어 & Hooks 실전 가이드"
description: "Claude Code에서 커스텀 슬래시 명령어와 hooks를 만들어 반복 작업을 자동화하고, 여러 단계의 작업을 원클릭으로 처리하는 방법을 알아봅니다."
pubDate: 2026-06-22
draft: false
tags: ["Claude Code", "slash commands", "hooks", "자동화", "개발자 도구"]
keywords: ["Claude Code slash commands", "Claude Code hooks", "custom commands"]
---

## 커스텀 명령어와 Hooks가 중요한 이유

Claude Code를 일주일 이상 사용해 보셨다면, 같은 프롬프트를 반복해서 입력하고 있다는 걸 느끼셨을 겁니다. "이 파일에 보안 이슈가 있는지 검토해줘." "방금 수정한 함수의 테스트를 작성해줘." "커밋하기 전에 diff를 요약해줘." 이런 반복적인 워크플로우가 바로 커스텀 슬래시 명령어와 hooks가 해결하려는 문제입니다.

Claude Code의 확장성 시스템을 사용하면 나만의 슬래시 명령어(`/your-command`으로 실행)와 hooks(특정 라이프사이클 시점에 자동 실행되는 스크립트)를 정의할 수 있습니다. 이 둘을 조합하면 Claude Code가 강력한 어시스턴트에서 *여러분의 워크플로우*를 아는 맞춤형 개발 환경으로 바뀝니다.

이 가이드에서는 실제 명령어와 hooks를 처음부터 직접 만들어 봅니다 — 이론만 늘어놓는 글이 아닙니다.

## 첫 번째 커스텀 슬래시 명령어 만들기

슬래시 명령어는 프로젝트의 `.claude/commands/` 디렉토리(프로젝트 스코프 명령어)나 `~/.claude/commands/`(모든 곳에서 사용 가능한 글로벌 명령어)에 마크다운 파일로 저장됩니다. 각 `.md` 파일은 파일명을 따라 명령어가 됩니다.

간단한 것부터 시작하겠습니다. 현재 diff를 검토해서 일반적인 이슈를 찾는 명령어를 만들어 보겠습니다:

```bash
mkdir -p .claude/commands
```

이제 `.claude/commands/review-diff.md`를 생성합니다:

```markdown
Review the current git diff and check for:

1. Security issues (hardcoded secrets, SQL injection, XSS)
2. Performance problems (N+1 queries, unnecessary re-renders)
3. Missing error handling
4. Typos in user-facing strings

Format your response as a checklist. If everything looks good, say so briefly.
```

이게 끝입니다. 다음에 Claude Code에서 `/review-diff`를 입력하면 현재 컨텍스트로 해당 프롬프트가 실행됩니다. 더 이상 다시 입력할 필요가 없습니다.

좀 더 고급 예제를 보겠습니다 — Conventional Commits 형식에 맞는 커밋 메시지를 생성하는 명령어입니다. `.claude/commands/commit-msg.md`를 생성합니다:

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

### 인수를 받는 명령어

슬래시 명령어는 `$ARGUMENTS` 플레이스홀더를 사용해 인수를 받을 수 있습니다. `.claude/commands/explain.md`를 생성합니다:

```markdown
Explain the following code concept in the context of this project: $ARGUMENTS

- Use examples from the actual codebase where possible
- Keep it under 200 words
- Assume I'm a mid-level developer
```

이제 `/explain dependency injection`이라고 입력하면 "dependency injection"이 인수로 전달됩니다.

## Hooks 이해하기: 자동 트리거

슬래시 명령어가 수동으로 호출하는 것이라면, hooks는 Claude Code 라이프사이클의 특정 시점에 자동으로 실행됩니다. `.claude/settings.json`의 `hooks` 키 아래에 설정합니다.

활용할 수 있는 hook 포인트는 다음과 같습니다:

| Hook 포인트 | 실행 시점 | 주요 사용 사례 |
|---|---|---|
| `PreToolUse` | 도구 실행 전 | 위험한 작업 검증 또는 차단 |
| `PostToolUse` | 도구 실행 후 | 작업 로깅, 파일 수정 후 linter 실행 |
| `Notification` | Claude가 알림을 보낼 때 | Slack으로 전달, 소리 재생 |
| `Stop` | Claude가 턴을 마칠 때 | 자동 테스트 실행, 요약 표시 |

각 hook은 셸 명령어를 실행하며, 종료 코드와 출력에 따라 Claude Code의 동작에 영향을 줄 수 있습니다.

## 첫 번째 Hook 작성: 저장 시 자동 Lint

Claude Code가 JavaScript나 TypeScript 파일을 수정할 때마다 자동으로 ESLint를 실행하는 hook을 만들어 보겠습니다. `.claude/settings.json`에 다음을 추가합니다:

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

`matcher` 필드는 어떤 도구가 hook을 트리거하는지 필터링하는 정규식입니다 — 여기서는 Claude가 `Write` 또는 `Edit` 도구를 사용할 때만 실행됩니다. hook은 `$CLAUDE_FILE_PATH` 같은 환경 변수를 통해 컨텍스트를 전달받습니다.

## 실전 Hook 레시피

오늘 바로 프로젝트에 적용할 수 있는 검증된 hooks입니다.

### 위험한 Git 작업 차단

Claude가 실수로 force-push하거나 브랜치를 reset하는 것을 방지합니다:

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

종료 코드 `2`는 Claude Code에게 작업을 완전히 차단하라고 알립니다. 종료 코드 `0`은 허용합니다.

### Python 파일 자동 포맷

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

### 긴 작업 완료 시 알림 보내기

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

(이것은 macOS 전용입니다. Linux에서는 `osascript`를 `notify-send`로 바꾸세요.)

## 명령어와 Hooks를 조합한 파워 워크플로우

진정한 마법은 둘을 조합할 때 일어납니다. 테스트 주도 개발 워크플로우 예시입니다:

**1단계**: `.claude/commands/tdd.md` 생성:

```markdown
I want to do TDD for: $ARGUMENTS

1. First, write a failing test for the described behavior
2. Run the test to confirm it fails
3. Write the minimal implementation to make it pass
4. Run the test again to confirm it passes
5. Refactor if needed, keeping tests green

Use the project's existing test framework and patterns. Show me each step.
```

**2단계**: 테스트 파일이 수정될 때마다 테스트 스위트를 실행하는 hook 추가:

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

이제 `/tdd user authentication`을 입력하면, Claude가 테스트를 작성하고, hook이 자동으로 실행(실패 확인)하고, Claude가 구현을 작성하고, hook이 다시 자동 실행(통과 확인)합니다. 전체 red-green-refactor 사이클이 자동으로 흐릅니다.

## 커스텀 설정 관리 팁

명령어와 hooks 컬렉션이 커지면 다음 사항을 유의하세요:

- **`.claude/` 디렉토리를 버전 관리하세요.** 팀원들도 `/review-diff`나 `/commit-msg` 같은 공유 명령어의 혜택을 받습니다. 개인 전용 명령어는 `~/.claude/commands/`에 추가하세요.
- **hooks는 빠르게 유지하세요.** Hooks는 동기적으로 실행됩니다 — 느린 hook은 Claude Code를 차단합니다. 무거운 작업(전체 테스트 스위트 등)이 필요하면 비동기로 실행하거나 특정 파일 패턴에만 적용하는 것을 고려하세요.
- **개인 hooks에는 `settings.local.json`을 사용하세요.** 프로젝트 레벨 `settings.json`은 공유되지만, `settings.local.json`은 gitignore 처리되어 본인만 사용합니다.
- **hooks는 먼저 독립적으로 테스트하세요.** Claude Code에 연결하기 전에 목 환경 변수로 셸 명령어를 직접 실행해 보세요. 조용히 실패하는 hook을 디버깅하는 건 고통스럽습니다.

```bash
# hook 명령어를 직접 테스트
CLAUDE_FILE_PATH="src/app.ts" bash -c 'FILE="$CLAUDE_FILE_PATH"; echo "Would lint: $FILE"'
```

- **명령어를 문서화하세요.** 각 `.md` 파일 상단에 언제, 왜 사용하는지 설명하는 주석을 추가하세요. 미래의 자신이 감사할 것입니다.

## 다음에 자동화할 것들

익숙해지면 다음과 같은 고가치 자동화를 고려해 보세요:

1. **사전 커밋 리뷰**: Claude가 변경한 내용을 커밋 전에 요약하는 hook
2. **변경 로그 생성**: 최근 커밋을 읽고 릴리스 노트를 작성하는 슬래시 명령어
3. **의존성 확인**: Claude가 새로운 npm/pip 패키지를 추가하면 플래그를 올리는 hook
4. **컨텍스트 로딩**: `CLAUDE.md`, 최근 PR, 오픈 이슈를 읽어 세션 시작 전에 Claude에게 브리핑하는 슬래시 명령어

커스텀 명령어와 hooks는 복리처럼 작동하는 기능입니다 — 투자할수록 미래의 모든 세션이 빨라집니다.

Claude Code를 API를 통해 사용하면서 이런 워크플로우를 실험할 때 비용을 낮게 유지하고 싶다면 **Conduit AI**를 확인해 보세요. Claude와 GPT 모델을 하나의 BASE URL로 사용할 수 있으며, 사용량 기반 과금으로 공식 가격 대비 약 1/8 수준(약 87% 절약)입니다. HK$50부터 충전 가능하고, 가입 시 HK$5 무료 크레딧이 제공됩니다.

---

**관련 글:**
- [Codex vs Cursor vs Claude Code — 솔직한 비교](/conduit-blog/ko/blog/codex-vs-cursor-vs-claude/)
- [최상위 모델을 저렴하게 쓰는 3가지 방법](/conduit-blog/ko/blog/low-cost-top-models/)
