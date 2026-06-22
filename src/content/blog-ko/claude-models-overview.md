---
title: "Claude 전 모델 한눈에 보기: Haiku부터 Opus까지 활용 사례"
description: "Haiku부터 Opus까지 모든 Claude 모델을 포괄적으로 비교합니다. 포지셔닝, 가격 티어, 최적 활용 사례를 통해 매번 올바른 모델을 선택할 수 있도록 도와드립니다."
pubDate: 2026-06-22
draft: false
tags: ["Claude", "AI 모델", "모델 비교", "Anthropic", "LLM"]
keywords: ["Claude model comparison", "Claude models overview", "haiku vs opus"]
---

## 모델 선택이 프롬프트 엔지니어링보다 중요한 이유

개발자들이 매일 저지르는 비용이 큰 실수가 있습니다: 모든 것에 "최고" Claude 모델을 사용하고 나서 왜 API 청구서가 예상보다 10배나 높은지 의아해하는 것입니다. 아니면 가장 저렴한 모델을 고르고 왜 출력 품질이 엉망인지 궁금해합니다.

올바른 작업에 올바른 Claude 모델을 선택하는 것이 가장 레버리지가 높은 최적화입니다. 품질 손실 없이 비용을 90% 절감하는 것이 드문 일이 아닙니다 — 단지 다른 작업을 다른 모델에 라우팅하는 것만으로 가능합니다. 이 가이드는 그 판단을 내리는 데 필요한 모든 것을 제공합니다.

## Claude 모델 전체 라인업

2026년 중반 현재, Anthropic의 Claude 패밀리에는 세 가지 티어에 걸쳐 여러 활성 모델이 있습니다. 전체 그림은 다음과 같습니다:

| 모델 | 티어 | 컨텍스트 윈도우 | 최대 출력 | 입력 가격 (100만 토큰당) | 출력 가격 (100만 토큰당) | 속도 | 지능 |
|---|---|---|---|---|---|---|---|
| **Claude Opus 4** | 플래그십 | 200K | 32K | $15.00 | $75.00 | 느림 | 최상 |
| **Claude Sonnet 4** | 균형 | 200K | 64K | $3.00 | $15.00 | 중간 | 매우 높음 |
| **Claude Haiku 3.5** | 속도 | 200K | 8K | $0.80 | $4.00 | 빠름 | 양호 |

*참고: 가격은 Anthropic 공식 API 기준입니다. 서드파티 게이트웨이에서는 상당한 할인을 제공할 수 있습니다.*

### Extended Thinking 모델

Claude Sonnet과 Opus는 복잡한 문제 해결을 위해 추가 "thinking 토큰"을 사용하는 extended thinking(추론 모드)도 지원합니다:

| 모델 + Thinking | Thinking 토큰 입력 | Thinking 토큰 출력 | 적합한 용도 |
|---|---|---|---|
| **Sonnet 4 (extended)** | $3.00/1M | $15.00/1M | 복잡한 코딩, 수학, 다단계 추론 |
| **Opus 4 (extended)** | $15.00/1M | $75.00/1M | 연구 수준 분석, 가장 어려운 문제 |

Thinking 토큰은 요금에 포함되므로, 추론이 많은 작업에서 extended thinking은 비용을 대략 2배로 늘립니다. 어려운 문제에는 그만한 가치가 있고, 쉬운 문제에는 낭비입니다.

## 모델 포지셔닝: 각 모델의 설계 목적

### Claude Haiku 3.5 — 워크호스

Haiku는 API 호출의 60-70%에 사용해야 하는 모델입니다. "멍청한" 것이 아닙니다 — *빠르고 효율적*입니다. Haiku가 처리하는 것들:

- **분류 및 라우팅**: 이 이메일이 스팸인지? 이 지원 티켓이 긴급한지?
- **데이터 추출**: 비정형 텍스트에서 정형 데이터 추출
- **단순 Q&A**: FAQ 봇, 지식 베이스 조회
- **텍스트 변환**: 요약, 재포맷, 번역
- **단순 패턴의 코드 생성**: CRUD 라우트, 보일러플레이트, 테스트 스캐폴딩

```python
# 완벽한 Haiku 작업: 정형 데이터 추출
response = client.messages.create(
    model="claude-haiku-3-5-20241022",
    max_tokens=256,
    messages=[{
        "role": "user",
        "content": f"Extract name, email, and company from this text. Return JSON only.\n\n{raw_text}"
    }]
)
```

Haiku는 보통 2초 이내에 응답하며 Sonnet의 일부 비용입니다. 답이 간단한 작업에는 더 비싼 모델을 사용할 이유가 전혀 없습니다.

### Claude Sonnet 4 — 올라운더

Sonnet은 진정한 추론이 필요한 작업의 기본 선택입니다. 지능 대비 비용의 최적 지점에 있습니다:

- **복잡한 코드 생성**: 아키텍처 설계, 리팩토링, 디버깅
- **분석 및 작문**: 기술 문서, 코드 리뷰, 상세 설명
- **다단계 추론**: "이런 제약 조건이 주어졌을 때, 최선의 접근법은?"
- **에이전틱 워크플로우**: Claude Code 등 자율 도구의 기본 모델
- **도구 사용 및 function calling**: 신뢰할 수 있는 정형 출력

```python
# 이상적인 Sonnet 작업: 추론을 동반한 코드 리뷰
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": f"Review this PR diff for bugs, security issues, and performance problems. Explain your reasoning.\n\n{diff}"
    }]
)
```

어떤 모델을 사용할지 모르겠다면, Sonnet이 거의 항상 안전한 선택입니다. 어려운 작업에 충분히 지능적이고, 정기 사용에 충분히 저렴합니다.

### Claude Opus 4 — 헤비 히터

Opus는 절대적으로 최고의 품질이 필요하고 비용이 부차적일 때를 위한 것입니다. 이것이 빛나는 지점:

- **연구 수준 분석**: 복잡한 데이터 해석, 문헌 리뷰
- **가장 어려운 코딩 문제**: 시스템 설계, 복잡한 알고리즘, 미묘한 버그
- **장문 콘텐츠**: 수천 단어에 걸쳐 일관성을 유지해야 하는 뉘앙스 있는 글쓰기
- **실수가 비용이 큰 작업**: 법률 분석, 의료 정보, 보안 감사
- **지속적 자율 작업**: 깊은 이해가 필요한 장시간 코딩 세션

```python
# Opus 비용을 정당화하는 경우: 품질이 대단히 중요한 작업
response = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=8192,
    messages=[{
        "role": "user",
        "content": f"Perform a security audit of this authentication module. Identify all vulnerabilities, rank by severity, and provide specific fixes.\n\n{code}"
    }]
)
```

Opus는 토큰당 Sonnet보다 5배 비쌉니다. 잘못된 답변의 비용이 API 호출 비용을 초과할 때 사용하세요.

## 의사결정 플로우차트

선택할 때 이 멘탈 모델을 사용하세요:

```
작업이 단순한가 (분류, 추출, 포맷팅)?
  → 예: Haiku 사용
  → 아니오: 진정한 추론이나 창의성이 필요한가?
      → 예: 완벽함이 중요하거나 문제가 극도로 어려운가?
          → 예: Opus 사용 (필요시 extended thinking과 함께)
          → 아니오: Sonnet 사용
      → 아니오: Haiku 사용
```

## 실제 라우팅: 실전 예시

프로덕션 애플리케이션에서 다양한 작업을 라우팅하는 방법:

| 작업 | 모델 | 월 비용 (10만 호출) | 이유 |
|---|---|---|---|
| 지원 티켓 분류 | Haiku | ~$16 | 단순 라우팅, 속도 중요 |
| 이메일 답변 생성 | Sonnet | ~$120 | 톤과 컨텍스트 인식 필요 |
| 문서 요약 | Haiku | ~$32 | 추출이지, 생성이 아님 |
| 사용자 보고 버그 디버깅 | Sonnet + thinking | ~$200 | 다단계 추론 필요 |
| 보안 코드 리뷰 | Opus | ~$500 | 실수의 비용이 높음 |
| UI 문자열 번역 | Haiku | ~$12 | 간단한 변환 |
| API 문서 작성 | Sonnet | ~$180 | 고품질 작문 + 기술 정확성 |

합계: 모델 라우팅 시 ~$1,060/월 vs. 모든 것에 Opus 사용 시 ~$4,200/월. **저렴한 모델로 라우팅된 작업에서 품질 차이가 거의 없으면서 75% 절약입니다.**

## 모델별 프롬프트 조정

각 모델 티어는 프롬프팅에 약간 다르게 반응합니다:

**Haiku**에 효과적인 것:
- 극도로 명확하고 구조화된 지시
- Few-shot 예시 (원하는 것을 보여주기)
- 출력 형식 제한 ("Return JSON only. No explanation.")

**Sonnet**에 효과적인 것:
- 작업의 "이유"에 대한 컨텍스트
- 추론할 여유 ("Think through this step by step")
- 유연성이 있는 적당한 구조

**Opus**에 효과적인 것:
- 풍부한 컨텍스트와 배경 정보
- 복잡하고 뉘앙스 있는 지시
- 탐색하고 포괄적 답변을 제공할 자유

## Extended Thinking을 사용할 때

Extended thinking(Sonnet과 Opus에서 사용 가능)은 모델이 응답하기 전에 문제를 추론하는 "스크래치패드"를 추가합니다. 다음 경우에 활성화하세요:

- 여러 유효한 접근법이 있고 최선을 찾아야 할 때
- 수학이나 논리가 관련될 때
- 디버깅 중이고 모델이 코드 실행을 추적해야 할 때
- 실행 전에 계획이 필요한 작업일 때

다음 경우에는 건너뛰세요:
- 답이 사실적이고 추론이 필요 없을 때
- 속도가 깊이보다 중요할 때
- 창의적 작업일 때 (extended thinking이 출력을 경직시킬 수 있음)

```python
# Extended thinking 사용
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000
    },
    messages=[{
        "role": "user",
        "content": "Find the bug in this function and explain why it only fails on edge cases.\n\n" + code
    }]
)
```

## 핵심 정리

1. **단순한 것에는 Haiku를 기본으로 사용하세요.** 대부분의 개발자가 과소 활용합니다.
2. **추론이 필요하면 Sonnet을 선택하세요.** 진지한 작업의 데일리 드라이버입니다.
3. **고위험 작업에 Opus를 예약하세요.** 품질이 5배 비용을 정당화할 때.
4. **Extended thinking은 선택적으로 사용하세요** — 강력하지만 토큰 사용량을 2배로 늘립니다.
5. **습관이 아닌 작업 기준으로 라우팅하세요.** 모델 혼합이 하나의 모델만 사용하는 것을 항상 이깁니다.

Claude 모델 간 라우팅하면서 비용을 낮추고 싶다면 **Conduit AI**가 도움이 됩니다. 모든 Claude 모델(extended thinking 포함)과 GPT를 하나의 BASE URL로 사용할 수 있는 통합 API 게이트웨이를 사용량 기반 과금으로 제공합니다 — 공식 가격 대비 약 1/8, 약 87% 절약. 구독 없이 HK$50부터 충전 가능하며, 가입 시 HK$5 무료 크레딧이 제공됩니다.

---

**관련 글:**
- [Thinking 모델이 가치 있을 때 — 그리고 돈을 낭비할 때](/conduit-blog/ko/blog/thinking-model-worth-it/)
- [Temperature와 max_tokens 튜닝 실전 가이드](/conduit-blog/ko/blog/temperature-max-tokens-guide/)
