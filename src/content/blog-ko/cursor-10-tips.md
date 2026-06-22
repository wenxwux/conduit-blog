---
title: "코딩 속도를 높여주는 10가지 숨겨진 Cursor 팁"
description: "대부분의 사용자가 놓치고 있는 10가지 Cursor IDE 팁과 트릭을 소개합니다. 새 도구로 갈아타지 않고도 코딩 속도를 극적으로 향상시킬 수 있습니다."
pubDate: 2026-06-22
draft: false
tags: ["Cursor", "생산성", "IDE", "개발자 도구", "팁"]
keywords: ["Cursor tips", "Cursor productivity", "Cursor hidden features"]
---

## 기본을 넘어서: Cursor를 더 잘 활용하기

Cursor를 설치하고, Tab 자동완성도 써보고, AI 사이드바와 대화도 해보셨을 겁니다. 축하합니다 — Cursor가 할 수 있는 것의 약 30%를 사용하고 계신 겁니다.

진정한 생산성 향상은 한 번도 열어보지 않은 메뉴, 한 번도 외우지 않은 키보드 단축키, 한 번도 토글하지 않은 설정에 숨어 있습니다. 이 글에서는 매일 Cursor를 사용하는 사람들도 지속적으로 놓치는 10가지 트릭을 다룹니다. 플러그인이나 확장 프로그램이 필요 없습니다 — 모두 내장 기능이며, 여러분이 발견하기만을 기다리고 있습니다.

## 1. `.cursorrules`로 반복 입력 없애기

Cursor에게 "TypeScript strict mode를 써줘"나 "우리 팀 네이밍 컨벤션을 따라줘"라고 매번 말하는 건 키 입력 낭비입니다. 프로젝트 루트에 `.cursorrules` 파일을 만드세요:

```markdown
## Project conventions
- TypeScript strict mode, no `any` types
- React functional components only, use hooks
- CSS modules for styling, no inline styles
- Error messages must be user-friendly, no technical jargon
- All API calls go through the `src/lib/api` module
- Test files colocated with source: `Component.test.tsx`
```

Cursor가 이 파일을 자동으로 읽고 모든 AI 상호작용에 이 규칙을 적용합니다. 팀 전체가 버전 관리를 통해 공유할 수 있습니다.

## 2. Composer로 멀티 파일 편집

대부분의 사람들은 Cursor 채팅을 단일 파일 질문에만 사용합니다. 하지만 Composer 모드(`Cmd+I` / `Ctrl+I`)를 사용하면 여러 파일에 걸친 변경사항을 한 번에 만들 수 있습니다.

핵심: **어떤 파일을 수정할지 명시적으로 지정하세요.** "사용자 인증 추가해줘" 대신 이렇게 해보세요:

```
Add JWT authentication:
1. Create src/middleware/auth.ts with verify and decode functions
2. Update src/routes/api.ts to use the auth middleware
3. Add LOGIN and REGISTER handlers to src/routes/auth.ts
4. Create src/types/auth.ts for User and Token interfaces
```

Composer가 네 개 파일 모두의 diff를 동시에 생성하고, 각각을 개별적으로 검토하고 수락할 수 있습니다.

## 3. `@` 멘션으로 정확한 컨텍스트 전달

Cursor 채팅의 `@` 기호는 놀라울 정도로 강력하지만, 대부분의 사람들은 `@file`만 사용합니다. 전체 메뉴는 다음과 같습니다:

| 멘션 | 기능 | 적합한 용도 |
|---|---|---|
| `@file` | 특정 파일 포함 | "Fix the bug in @src/utils.ts" |
| `@folder` | 전체 디렉토리 포함 | "Refactor everything in @src/components" |
| `@codebase` | 전체 저장소 검색 | "Where is the database connection configured?" |
| `@web` | 인터넷 검색 | "What's the latest React Router API?" |
| `@docs` | 문서 검색 | "How does @docs Prisma handle migrations?" |
| `@git` | git 히스토리 참조 | "What changed in the last 3 commits?" |

조합해서 사용하세요: "Using the patterns in @src/components/Button.tsx, create a new Dropdown component. Check @docs Radix UI for accessibility best practices."

## 4. `Cmd+Right Arrow`로 부분 수락

Cursor가 여러 줄 자동완성을 제안할 때, 전부 수락하거나 전부 거부할 필요가 없습니다. `Cmd+Right Arrow`(Mac) 또는 `Ctrl+Right Arrow`(Windows/Linux)를 누르면 **단어 단위로** 수락할 수 있습니다. 제안이 80%는 맞지만 중간에서 방향을 바꾸고 싶을 때 완벽합니다.

줄 단위 수락도 가능해서 더 세밀한 제어가 가능합니다. 전체 제안을 거부하고 처음부터 다시 입력하지 않아도 정밀 편집이 됩니다.

## 5. `Cmd+K`로 인라인 편집

`Cmd+K`가 인라인 편집 바를 여는 건 아시겠지만, 이런 패턴이 특히 빛을 발합니다:

- **코드를 먼저 선택한 후 `Cmd+K`**: "Convert this to async/await" — 선택 영역만 변환
- **선택 없이 한 줄에 커서를 놓고 `Cmd+K`**: "Add error handling" — 정확히 그 위치에 코드 생성
- **함수 시그니처를 선택**: "Add JSDoc with parameter descriptions" — 문서화에 완벽

핵심 인사이트: `Cmd+K`는 수술적 편집용입니다. 채팅은 탐색용입니다. Composer는 멀티 파일 오케스트레이션용입니다. 각 규모의 변경에 맞는 도구를 사용하는 것이 빠른 사용자와 나머지를 구분합니다.

## 6. OpenAI 호환 엔드포인트를 통한 커스텀 AI 모델

Cursor는 번들된 모델에 고정되어 있지 않습니다. **Settings → Models**에서 OpenAI 호환 API 엔드포인트를 추가할 수 있습니다. 즉 다음과 같은 것들을 사용할 수 있습니다:

- Ollama나 LM Studio를 통한 로컬 모델
- 커스텀 파인튜닝 모델
- 다른 요금을 제공하는 서드파티 API 게이트웨이

```
# 예시: Cursor를 커스텀 엔드포인트로 연결
API Base URL: https://api.example.com/v1
API Key: sk-your-key-here
Model: claude-sonnet-4-20250514
```

비용을 관리하거나 Cursor가 기본 제공하지 않는 특정 모델을 사용하고 싶을 때 특히 유용합니다. Cursor의 UI와 워크플로우는 유지하면서 요청을 원하는 곳으로 라우팅할 수 있습니다.

## 7. 터미널 통합: 채팅에서 명령어 실행

채팅 패널에서 터미널 명령어가 포함된 코드 제안을 받았을 때, 복사-붙여넣기할 필요가 없습니다. "Run in Terminal" 버튼을 사용하면 Cursor의 통합 터미널에서 직접 실행됩니다.

하지만 더 깊은 트릭은 터미널을 반대 방향으로 사용하는 것입니다: **터미널에서 에러 메시지를 선택**하고, 우클릭해서 "Send to Chat"을 선택하세요. Cursor가 전체 컨텍스트와 함께 에러를 받아 즉시 진단할 수 있습니다 — 더 이상 수동으로 스택 트레이스를 복사할 필요가 없습니다.

## 8. AI로 탐색: 강화된 심볼 검색

`Cmd+Shift+P`를 누르고 "AI"를 입력하면 모든 AI 강화 탐색 명령어를 볼 수 있습니다. 가장 활용도가 낮은 것: **"Go to Related Code."**

함수에 커서를 놓고 이 명령어를 실행하면 Cursor가 다음을 찾습니다:

- 이 함수가 호출되는 곳
- 관련 테스트 파일
- 코드베이스 내 유사 구현
- 이 코드에 영향을 미치는 설정

텍스트 검색의 "Find References"와 비슷하지만 구문적이 아닌 의미적으로 작동합니다. 텍스트 검색이 놓치는 관계를 잡아냅니다.

## 9. 대화 체크포인트 & 복원

긴 Cursor 채팅 세션은 비대해집니다. 생산성을 유지하는 패턴은 다음과 같습니다:

1. 집중된 대화를 시작합니다: "We're refactoring the payment module."
2. 자연스러운 분기점에 도달하면, 요약을 새 `.cursorrules` 섹션이나 `CONTEXT.md` 파일에 복사합니다.
3. 그 파일을 참조하며 새 대화를 시작합니다.

이것이 하나의 거대한 대화보다 나은 이유:
- 토큰 사용량이 적게 유지됩니다 (더 빠르고 저렴한 응답)
- 컨텍스트가 관련성을 유지합니다 (200개 메시지 전의 오래된 정보 없음)
- 분기할 수 있습니다: 같은 체크포인트에서 다른 접근법을 탐색하는 두 대화를 시작 가능

## 10. 놓치고 있는 키보드 단축키

파워 유저와 일반 사용자를 구분하는 단축키 치트시트입니다:

| 단축키 | 동작 |
|---|---|
| `Cmd+L` | 현재 파일을 컨텍스트로 채팅 열기 |
| `Cmd+I` | 멀티 파일 편집을 위한 Composer 열기 |
| `Cmd+K` | 커서 위치에서 인라인 편집 |
| `Cmd+Shift+L` | 선택 영역을 채팅 컨텍스트에 추가 |
| `Cmd+Shift+K` | 커서 위치에 코드 생성 |
| `Cmd+.` | AI로 빠른 수정 |
| `Tab` | 전체 제안 수락 |
| `Cmd+Right Arrow` | 단어 단위로 수락 |
| `Escape` | 제안 무시 |

이걸 인쇄해서 모니터 옆에 붙여두세요. 일주일 후면 대부분이 근육 기억이 되어 이것 없이 어떻게 코딩했는지 의아하게 될 겁니다.

## 모든 것을 조합하기

Cursor에서 빨라지는 비결은 하나의 마법 기능을 배우는 게 아닙니다 — 이것들을 체이닝하는 워크플로우를 구축하는 것입니다. 파워 유저의 전형적인 세션은 이렇습니다:

1. `.cursorrules`가 이미 설정된 프로젝트를 엽니다 (트릭 1)
2. `@codebase`로 작업 대상을 파악합니다 (트릭 3)
3. 멀티 파일 편집을 Composer에서 계획합니다 (트릭 2)
4. 세밀한 인라인 조정에 `Cmd+K`를 사용합니다 (트릭 5)
5. 거의 맞는 제안을 부분 수락합니다 (트릭 4)
6. 터미널 출력을 채팅에 보내 에러를 디버깅합니다 (트릭 7)

각 트릭이 몇 초를 절약합니다. 하루 종일 코딩하면 초가 시간이 됩니다. 일 년이면 그렇지 않았을 때보다 몇 주나 앞서 배포하게 됩니다.

커스텀 API 엔드포인트(트릭 6)로 Cursor를 사용한다면, **Conduit AI**를 살펴보세요 — Claude와 GPT 모델 모두를 위한 단일 OpenAI 호환 BASE URL을 사용량 기반 과금(공식 가격 대비 약 1/8, 약 87% 절약)으로 제공합니다. 구독이 필요 없습니다 — HK$50부터 충전하면 바로 코딩을 시작할 수 있습니다. 가입 시 HK$5 무료 크레딧도 있습니다.

---

**관련 글:**
- [Codex vs Cursor vs Claude Code — 솔직한 비교](/conduit-blog/ko/blog/codex-vs-cursor-vs-claude/)
- [Temperature와 max_tokens 튜닝 실전 가이드](/conduit-blog/ko/blog/temperature-max-tokens-guide/)
