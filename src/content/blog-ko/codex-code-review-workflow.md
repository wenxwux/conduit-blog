---
title: "Codex로 자동화된 코드 리뷰 워크플로 구축하기"
description: "Codex로 자동화된 코드 리뷰를 구성하는 실전 가이드: pre-commit 점검, CI 통합, 리뷰 프롬프트, 그리고 신호는 높이고 잡음은 낮게 유지하는 법."
pubDate: 2026-06-19
tags: ["Codex", "코드 리뷰", "자동화"]
keywords: ["Codex 코드 리뷰", "자동화된 코드 리뷰", "Codex CI 워크플로"]
draft: false
---

수동 코드 리뷰는 가치 있지만 느리고, 리뷰어는 지쳐 있습니다. 해법은 사람을 대체하는 게 아니라, 그들 앞에 AI 패스를 두어 명백한 것들(조용한 실패, 놓친 엣지 케이스, 규약 이탈)을 사람이 보기 전에 잡아내는 것입니다. 저는 한동안 Codex를 그 1차 리뷰어로 돌려 왔습니다. 실제로 견고하게 버티는 설정을 소개합니다.

## 목표: 2단계 리뷰

제가 쓰는 멘탈 모델:

1. **1단계 — Codex**가 모든 변경마다 기계적·패턴 수준의 이슈를 자동으로 잡습니다.
2. **2단계 — 사람**이 설계, 의도, 그리고 AI가 약한 판단의 영역에 집중합니다.

1단계의 핵심은 2단계를 *더 저렴하게* 만드는 것이지, 없애는 게 아닙니다. Codex가 열 가지를 지적했고 그중 여덟이 진짜라면, 사람 리뷰어는 훨씬 나은 출발점에서 시작합니다.

## 1단계: 로컬 pre-commit 패스

문제를 잡을 수 있는 가장 이른 시점은 커밋되기도 전입니다. 저는 staged 변경분을 리뷰하는 pre-commit 단계에 Codex를 연결합니다.

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

기본적으로 이걸 **차단하지 않게** 둡니다. 발견 사항을 출력하되 커밋을 거부하지는 않습니다. 오탐에 발동하는 차단 게이트는 사람들이 우회하도록 훈련시켜 본래 목적을 무너뜨립니다.

## 2단계: 초점이 분명한 리뷰 프롬프트

리뷰의 품질은 대부분 프롬프트의 품질입니다. 모호한 "이 코드 리뷰해줘"는 모호한 출력을 줍니다. 저는 Codex에게 빡빡한 채점 기준을 줍니다.

> 이 diff를 리뷰하라. 확신하는 이슈만 보고하라. 각각에 대해: 파일과 줄, 심각도(high/medium/low), 한 문장으로 된 문제, 구체적 수정안을 제시하라. 우선순위: 조용한 실패와 삼켜진 에러, 누락된 에러 처리, 엣지 케이스(null/빈 값/경계), 프로젝트 기존 규약 위반. 포매터가 이미 처리하는 스타일은 **언급하지 마라**. diff가 깨끗하면 그렇다고 말하라.

마지막 지시가 중요합니다. 말할 게 없을 때 조용히 있으라고 시키는 것이 잡음을 낮게 유지하는 비결입니다.

## 3단계: CI에 연결하기

로컬 훅도 도움이 되지만, CI는 그것이 팀 습관이 되는 곳입니다. 모든 풀 리퀘스트마다 리뷰 작업을 돌리고 결과를 PR 댓글로 게시합니다.

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

실무에서 돌리며 얻은 몇 가지 메모:

- `OPENAI_BASE_URL`을 단일 게이트웨이 엔드포인트로 가리켜, 같은 시크릿이 로컬 훅과 CI에서 함께 작동하게 하고, 워크플로를 건드리지 않고도 기반 모델을 교체할 수 있게 합니다.
- `fetch-depth: 0`이 중요합니다. base 브랜치와 diff 하려면 전체 히스토리가 필요합니다.
- 리뷰를 저장소 전체가 아니라 **diff**로 한정하세요. 변경되지 않은 코드를 리뷰하면 token을 낭비하고 진짜 발견을 묻어버립니다.

## 4단계: 신호에 맞춰 튜닝하기

첫 주에는 가치 낮은 댓글이 너무 많을 겁니다. 조여 보세요.

| 증상 | 해결법 |
|---|---|
| 사소한 트집이 너무 많음 | "린터/포매터가 다루는 건 무시" 추가 |
| 이미 의도된 것을 지적함 | 관련 규약/CLAUDE.md 컨텍스트 제공 |
| 진짜 버그를 놓침 | 명시적 카테고리 추가(동시성, off-by-one, 자원 누수) |
| 댓글이 너무 길어 못 읽음 | 출력 제한: "최대 8개 발견, 심각도 높은 순" |

여러분이 돌리는 다이얼은 **신뢰도 임계값**입니다. 고신뢰 이슈만 보고하라고 시키면, 몇 가지 사소한 누락을 감수하는 대신 팀이 실제로 읽을 댓글을 얻습니다.

## 사람에게 남겨야 할 것

저는 AI 패스가 머지 결정을 내리게 절대 두지 않습니다. Codex는 다음에 능합니다: 삼켜진 예외, 처리되지 않은 null, 복붙 버그, 일관성 없는 에러 처리, 누락된 테스트 케이스. 다음에는 약합니다: 그 기능이 *올바른* 기능인지, 그 추상화가 잘 늙을지, 변경이 암묵적 팀 컨텍스트에 맞는지. 그건 리뷰어의 일이며, 이제 기계적 패스가 이미 돌았으니 그들에게 그럴 에너지가 있습니다.

## 마무리

여기서의 승리는 "AI가 내 코드를 리뷰한다"가 아니라, 계층화된 파이프라인입니다. pre-commit이 명백한 걸 잡고, CI가 그것을 팀 규범으로 만들고, 사람은 가치 있는 곳에 주의를 씁니다. 차단하지 않는 로컬 훅으로 시작해 프롬프트를 튜닝한 뒤, 신호가 좋아지면 CI로 승격하세요. 몇 주 안에 AI 패스는 보이지 않는 인프라가 되고, 누군가 열어 보기도 전에 여러분의 PR이 더 깨끗해집니다.

관련 읽을거리: [Claude Code 서브에이전트: 병렬 작업을 처음부터 끝까지 실행하기](/conduit-blog/ko/blog/claude-code-subagents/)
