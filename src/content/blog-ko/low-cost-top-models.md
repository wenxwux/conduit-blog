---
title: "최상위 모델을 저렴하게 쓰는 3가지 방법 (사용량 기반 과금, 모델 선택, 토큰 절감)"
description: "Claude Opus, GPT-4o 같은 최상위 AI 모델을 공식 가격 대비 약 1/8에 사용하는 세 가지 검증된 전략 — 사용량 기반 게이트웨이, 스마트 모델 선택, 토큰 절감 기법."
pubDate: 2026-06-22
draft: false
tags: ["비용 최적화", "LLM", "사용량 기반 과금", "저예산", "토큰 최적화"]
keywords: ["low cost AI", "save 87%", "pay as you go LLM"]
---

## 문제: 최상위 모델, 최상위 가격

가장 어려운 코딩 작업에 Claude Opus를 쓰고 싶습니다. 멀티모달 파이프라인에 GPT-4o를 쓰고 싶습니다. 일상적인 에이전틱 워크플로우에 Sonnet을 쓰고 싶습니다. 하지만 청구서를 보면 — 여기 $150, 저기 $300 — 가슴이 아픕니다.

핵심은 이겁니다: 대부분의 개발자는 AI에 5~10배 초과 지불합니다. 모델이 비싸서가 아니라, 세 가지 고칠 수 있는 실수 때문입니다: 도매가가 있는데 소매가를 내는 것, 싼 작업에 비싼 모델을 쓰는 것, 필요 이상으로 많은 토큰을 보내는 것.

이 글에서는 결합 시 LLM 비용을 약 87% 절감할 수 있는 세 가지 구체적인 전략을 다룹니다. 품질 타협 없이. 의심스러운 편법 없이. 더 똑똑한 지출만으로.

## 전략 1: API 게이트웨이를 통한 사용량 기반 과금

### 직접 API 가격의 문제

Claude나 GPT를 공식 API로 사용하면, 소매가를 내는 것입니다:

| 모델 | 공식 입력 가격 | 공식 출력 가격 |
|---|---|---|
| Claude Opus 4 | $15.00 / 1M 토큰 | $75.00 / 1M 토큰 |
| Claude Sonnet 4 | $3.00 / 1M 토큰 | $15.00 / 1M 토큰 |
| Claude Haiku 3.5 | $0.80 / 1M 토큰 | $4.00 / 1M 토큰 |
| GPT-4o | $2.50 / 1M 토큰 | $10.00 / 1M 토큰 |

1인 개발자나 소규모 팀에게 이 가격은 빠르게 쌓입니다. Claude Code를 많이 쓰는 하루(내부적으로 Sonnet 사용)는 토큰 비용이 $20~50 쉽게 나옵니다.

### 게이트웨이 대안

API 게이트웨이는 수요를 집약하고 대량 가격을 협상해서, 절약분을 여러분에게 전달합니다. 최고의 게이트웨이가 제공하는 것:

- **같은 모델, 같은 품질** — 공식 API로 요청이 프록시됨
- **사용량 기반 과금** — 월 구독 없이, 사용한 만큼만 지불
- **상당한 할인** — 공식 가격 대비 보통 60~87% 할인
- **단일 엔드포인트** — 여러 프로바이더(Claude + GPT)를 위한 하나의 BASE URL

실제 비용 차이는 이렇습니다:

```python
# 직접 Anthropic API
# Claude Sonnet, 100K 입력 + 20K 출력 토큰
cost_direct = (100_000 * 3.00 / 1_000_000) + (20_000 * 15.00 / 1_000_000)
# = $0.30 + $0.30 = 세션당 $0.60

# 게이트웨이로 ~1/8 가격
cost_gateway = 0.60 / 8
# ≈ 세션당 $0.075

# 30일, 하루 10세션:
monthly_direct = 0.60 * 10 * 30   # = $180
monthly_gateway = 0.075 * 10 * 30 # = $22.50

# 연간 절약: ~$1,890
```

### 설정 방법

게이트웨이로 전환은 보통 한 줄 설정 변경입니다:

```python
# 변경 전: 직접 API
import anthropic
client = anthropic.Anthropic(
    api_key="sk-ant-your-key"
)

# 변경 후: 게이트웨이 경유 (같은 SDK, 다른 base URL)
client = anthropic.Anthropic(
    api_key="your-gateway-key",
    base_url="https://gateway.example.com/v1"
)
```

Claude Code나 Cursor 같은 도구에서는 보통 환경 변수입니다:

```bash
# Claude Code
export ANTHROPIC_BASE_URL="https://gateway.example.com"
export ANTHROPIC_API_KEY="your-gateway-key"

# Cursor: Settings → Models → API Base URL
```

코드, 프롬프트, 워크플로우는 완전히 동일합니다. 유일한 변경은 요청이 어디로 가는가입니다.

## 전략 2: 스마트 모델 선택 (올바른 모델, 올바른 작업)

### 대부분의 개발자는 오버스펙 모델을 씁니다

항상 보는 패턴이 있습니다: 개발자가 *모든 것*에 Sonnet이나 GPT-4o를 기본으로 쓰면서 "충분히 좋고 생각하기 싫으니까"라고 합니다. 결과는? 더 저렴한 모델이 동일하게 처리하는 작업에 4~19배 더 비싼 비용을 내는 것입니다.

### 모델 라우팅 원칙

다른 작업은 근본적으로 다른 지능 요구사항을 가집니다:

| 작업 복잡도 | 적절한 모델 | 상대 비용 |
|---|---|---|
| 단순 (분류, 추출, 포맷팅) | Haiku / GPT-4o mini | 1x (기준선) |
| 중간 (작문, 코드 생성, 분석) | Sonnet / GPT-4o | 4-5x |
| 어려운 (아키텍처, 디버깅, 연구) | Sonnet + thinking | 8-10x |
| 가장 어려운 (보안 감사, 신규 알고리즘) | Opus / o3 | 19-25x |

핵심 인사이트: **일반적인 API 호출의 약 60~70%가 Haiku가 Opus만큼 잘 처리하는 "단순" 작업입니다.**

### 모델 라우터 구현

어떤 애플리케이션에든 바로 넣을 수 있는 실전 라우터입니다:

```python
from enum import Enum

class TaskComplexity(Enum):
    SIMPLE = "simple"
    MEDIUM = "medium" 
    HARD = "hard"
    HARDEST = "hardest"

MODEL_MAP = {
    TaskComplexity.SIMPLE:  "claude-haiku-3-5-20241022",
    TaskComplexity.MEDIUM:  "claude-sonnet-4-20250514",
    TaskComplexity.HARD:    "claude-sonnet-4-20250514",  # + thinking
    TaskComplexity.HARDEST: "claude-opus-4-20250514",
}

def classify_task(task_description: str) -> TaskComplexity:
    """단순 규칙 기반 라우터. 복잡한 앱에서는 LLM 기반 라우팅으로 교체."""
    
    simple_keywords = ["classify", "extract", "format", "translate", "categorize", 
                       "yes/no", "true/false", "summarize", "convert"]
    hard_keywords = ["debug", "architect", "security", "optimize", "design system",
                     "find the bug", "root cause"]
    hardest_keywords = ["audit", "vulnerability", "novel algorithm", "proof"]
    
    desc_lower = task_description.lower()
    
    if any(kw in desc_lower for kw in hardest_keywords):
        return TaskComplexity.HARDEST
    if any(kw in desc_lower for kw in hard_keywords):
        return TaskComplexity.HARD
    if any(kw in desc_lower for kw in simple_keywords):
        return TaskComplexity.SIMPLE
    return TaskComplexity.MEDIUM

def get_model_config(task_description: str) -> dict:
    complexity = classify_task(task_description)
    config = {
        "model": MODEL_MAP[complexity],
        "temperature": 0 if complexity == TaskComplexity.SIMPLE else 0.3,
        "max_tokens": 256 if complexity == TaskComplexity.SIMPLE else 2048,
    }
    
    if complexity == TaskComplexity.HARD:
        config["thinking"] = {"type": "enabled", "budget_tokens": 5000}
    
    return config
```

### 실제 비용 영향

월 50,000건 API 호출을 처리하는 스타트업의 라우팅 적용 결과:

| 접근법 | 월 비용 |
|---|---|
| 전부 Opus | ~$4,500 |
| 전부 Sonnet | ~$900 |
| 스마트 라우팅 (70% Haiku, 25% Sonnet, 5% Opus) | ~$270 |
| 스마트 라우팅 + 게이트웨이 가격 | ~$34 |

"그냥 최고 모델 쓰자" 접근법 대비 99% 절감입니다.

## 전략 3: 더 적은 토큰 보내기 (같은 품질)

### 토큰이 숨어 있는 곳

토큰 청구서에는 두 면이 있습니다: 입력 토큰(보내는 것)과 출력 토큰(받는 것). 대부분의 개발자는 출력에 집중하지만 입력을 무시합니다 — 여기서 더 큰 절약이 가능한 경우가 많습니다.

숨겨진 토큰 소비원:

1. **매 호출마다 반복되는 시스템 프롬프트** — 500단어 시스템 프롬프트가 모든 메시지마다 토큰을 소비
2. **전체 대화 히스토리** — 마지막 5개만 중요한데 50개 메시지의 컨텍스트를 보냄
3. **압축되지 않은 코드** — 50줄만 관련 있는데 2,000줄 전체 파일을 보냄
4. **장황한 지시** — 하지 말아야 할 것을 10가지 방식으로 설명

### 기법 1: 대화 히스토리 정리

```python
def trim_history(messages, max_messages=10, max_tokens_estimate=4000):
    """대화 히스토리를 관리 가능하게 유지."""
    if len(messages) <= max_messages:
        return messages
    
    # 항상 첫 메시지(컨텍스트 설정)와 마지막 N개 메시지 유지
    return [messages[0]] + messages[-(max_messages - 1):]
```

### 기법 2: 관련 코드만 추출

```python
# 나쁨: 전체 파일 보내기
with open("src/app.py") as f:
    prompt = f"Review this code:\n\n{f.read()}"  # 2000줄 = ~8000 토큰

# 좋음: 관련 함수만 보내기
prompt = f"""Review this function for bugs:

```python
{extract_function("src/app.py", "process_payment")}
```

Context: This function is called from the checkout endpoint in a Flask app.
"""
# ~200줄 = ~800 토큰 (90% 절약)
```

### 기법 3: 시스템 프롬프트 압축

```python
# 비대함: 800 토큰
system = """You are a customer support assistant for Acme Corp. 
You help customers with their questions about our products and services.
You should always be polite and professional. Never be rude to customers.
You should not make up information. Only answer based on the provided context.
If you don't know the answer, tell the customer you'll escalate to the team.
You should not discuss competitors. You should not discuss pricing unless asked.
...(20줄 더 계속)"""

# 압축됨: 150 토큰 (같은 동작)
system = """Acme Corp support assistant. Rules:
- Answer from provided context only; escalate if unsure
- Professional tone, concise responses
- No competitor discussion; pricing only when asked"""
```

### 기법 4: 간결한 출력 요청

```python
# 명시적 길이 가이드로 응답이 짧아짐 (출력 토큰 감소)
prompt = f"""Classify this ticket as: billing, technical, account, or other.
Reply with ONLY the category name, nothing else.

Ticket: {ticket_text}"""
```

### 합산 절약 효과

| 최적화 | 토큰 감소 | 비용 영향 |
|---|---|---|
| 대화 히스토리 정리 | 입력 40-60% 감소 | 멀티턴 대화당 -40% |
| 관련 코드만 추출 | 입력 80-90% 감소 | 코드 리뷰 호출당 -70% |
| 시스템 프롬프트 압축 | 70-80% 감소 | 전체적으로 -5% (호출당 적지만 누적됨) |
| 간결한 출력 요청 | 출력 50-80% 감소 | 출력 비용 -30% |

## 세 가지 전략의 합산 효과

실제 시나리오에 모두 적용해 보겠습니다 — 하루 1,000건 API 호출을 하는 개발팀:

| 전략 | 변경 전 | 변경 후 | 절약 |
|---|---|---|---|
| 기준선 (전부 Sonnet, 직접 API) | $450/월 | — | — |
| + API 게이트웨이 (1/8 가격) | — | $56/월 | 87% |
| + 스마트 모델 라우팅 | — | $22/월 | 95% |
| + 토큰 최적화 | — | $14/월 | 97% |

$450에서 $14로. 같은 모델. 모든 작업에서 같은 품질. 더 똑똑한 지출뿐입니다.

## 오늘 시작하기

세 가지 전략을 모두 적용하는 가장 빠른 방법:

1. **사용량 기반 게이트웨이로 전환** — 설정 한 번 변경, 즉각 절약
2. **API 호출 감사** — 어떤 모델을 무엇에 쓰고 있는지 로깅하고, 가장 비싼 모델이 필요 없는 작업 식별
3. **토큰 수 확인** — 호출당 평균 입력/출력 토큰을 보고 "이게 다 필요한가?" 질문

전략 1을 바로 시작할 준비가 되셨다면, **Conduit AI**는 Claude와 GPT 모델 모두를 위한 하나의 BASE URL로 공식 가격 대비 약 1/8에 제공하는 통합 LLM API 게이트웨이입니다. 구독 없이 HK$50부터 사용량 기반 과금이며, 가입 시 HK$5 무료 크레딧이 제공됩니다. Claude Code, Cursor, Codex와 네이티브로 호환되어 워크플로우를 바꾸지 않고 몇 분 안에 절약을 시작할 수 있습니다.

---

**관련 글:**
- [Claude 전 모델 한눈에 보기: Haiku부터 Opus까지 활용 사례](/conduit-blog/ko/blog/claude-models-overview/)
- [AI 고객지원 봇을 처음부터 만들기 — 최소 비용 버전](/conduit-blog/ko/blog/ai-support-bot-budget/)
