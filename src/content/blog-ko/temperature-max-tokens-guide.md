---
title: "Temperature와 max_tokens 튜닝 실전 가이드"
description: "temperature, max_tokens, top_p 등 LLM API 파라미터를 조정해 출력 품질은 높이고, 비용은 줄이고, 응답 속도는 빠르게 만드는 방법을 구체적 예시와 함께 설명합니다."
pubDate: 2026-06-22
draft: false
tags: ["LLM", "API 파라미터", "temperature", "max_tokens", "최적화"]
keywords: ["temperature tuning", "max_tokens setting", "LLM parameter tuning"]
---

## 대부분의 개발자가 잘못 설정하는 파라미터

Claude나 GPT에 API를 호출할 때마다, 출력이 훌륭할지 비싼 쓰레기가 될지를 조용히 결정하는 몇 가지 파라미터를 보냅니다. 대부분의 개발자는 이것들을 기본값으로 놔두고 건드리지 않습니다. 이것은 실수입니다.

가장 중요한 세 가지 파라미터는 `temperature`, `max_tokens`, `top_p`입니다. 이것들을 제대로 설정하면 프롬프트를 한 단어도 바꾸지 않고 출력 품질 향상, 비용 30~50% 절감, 응답 속도 향상을 달성할 수 있습니다. 이 가이드에서 방법을 알려드립니다.

## Temperature: 창의성 다이얼

Temperature는 모델의 토큰 선택에서 무작위성을 제어합니다. 낮은 temperature = 더 결정론적이고 집중된 결과. 높은 temperature = 더 창의적이고 다양한 결과.

| Temperature | 동작 | 적합한 용도 |
|---|---|---|
| 0.0 | 거의 결정론적 — 같은 입력, 같은 출력 | 코드 생성, 데이터 추출, 분류 |
| 0.1 - 0.3 | 약간의 변이, 여전히 매우 집중적 | 기술 문서, 분석, 팩트 기반 Q&A |
| 0.4 - 0.7 | 균형 잡힌 창의성과 일관성 | 일반 글쓰기, 브레인스토밍, 대화 |
| 0.8 - 1.0 | 매우 창의적, 더 놀라운 선택 | 창작 글쓰기, 마케팅 카피, 아이디어 발상 |

### Temperature 실전 적용

같은 프롬프트를 다른 temperature로 실행한 경우:

```python
import anthropic
client = anthropic.Anthropic()

# Temperature 0: 결정론적, 코드 생성용
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0,
    messages=[{
        "role": "user",
        "content": "Write a Python function to validate an email address using regex."
    }]
)
# 결과: 깔끔하고 표준적인 구현. 매번 동일.

# Temperature 0.8: 창의적, 브레인스토밍용
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.8,
    messages=[{
        "role": "user",
        "content": "Suggest 5 creative names for a developer productivity tool."
    }]
)
# 결과: 다양하고 놀라운 제안. 매번 다름.
```

### 흔한 Temperature 실수

**실수 1: 코드에 높은 temperature 사용.** 코드 생성에서 Temperature 0.7+는 구문적으로는 유효하지만 논리적으로 잘못된 코드를 만듭니다. 모델이 변수명에 "창의적"이 되거나, 불필요한 추상화를 추가하거나, 존재하지 않는 API를 만들어냅니다.

```python
# 나쁨: 코드에 높은 temperature
temperature=0.9  # 모델이 존재하지 않는 메서드를 "창의적으로" 사용할 수 있음

# 좋음: 코드에 낮은 temperature
temperature=0    # 모델이 알려진 신뢰할 수 있는 패턴을 따름
```

**실수 2: 창의적 작업에 temperature 0 사용.** 밋밋하고 정형화된 출력을 얻습니다. 마케팅 카피를 생성하거나 브레인스토밍한다면, 약간의 무작위성이 *필요*합니다.

**실수 3: Temperature를 지능으로 혼동.** 높은 temperature는 모델을 더 똑똑하게 만들지 않습니다 — 확률이 낮은 토큰을 선택하려는 의지를 높일 뿐입니다. 어려운 추론 작업에는 temperature 0이 보통 최선입니다. 가장 높은 확률(가장 "확신하는") 답을 원하기 때문입니다.

## max_tokens: 필요 없는 출력에 돈을 내지 마세요

`max_tokens`는 응답 길이의 상한을 설정합니다. 비용과 품질 모두에 가장 직접적인 영향을 미치는 파라미터입니다.

### 왜 낮은 게 보통 더 나은가

모든 출력 토큰에 비용이 듭니다. 문서에서 숫자 하나를 추출하는 것이라면, `max_tokens: 4096`이 필요 없습니다. 64로 설정하면 출력 토큰의 98%를 절약합니다.

```python
# 낭비: 단순 추출에 기본 max_tokens
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,  # 절대 쓰지 않을 버퍼에 돈을 냄
    messages=[{
        "role": "user",
        "content": "What is the total amount on this invoice?\n\n" + invoice_text
    }]
)
# 출력: "$1,234.56" — 허용된 4096 중 ~10 토큰 사용

# 최적화: 적절한 크기의 max_tokens
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=64,  # 숫자와 간단한 컨텍스트에 충분
    messages=[{
        "role": "user",
        "content": "What is the total amount on this invoice? Reply with just the number.\n\n" + invoice_text
    }]
)
```

*참고: 실제 생성된 토큰에 대해서만 과금되며, max_tokens 값 자체에 대해 과금되지 않습니다. 하지만 낮은 max_tokens 설정에는 두 가지 실질적 이점이 있습니다: 모델이 횡설수설하는 것을 방지하고(실제 토큰 비용 발생), 간결한 출력을 강제합니다.*

### 작업별 적절한 max_tokens

| 작업 | 권장 max_tokens | 이유 |
|---|---|---|
| 예/아니오 분류 | 8-16 | 한 단어 답 |
| 데이터 추출 (JSON) | 128-512 | 정형화된, 예측 가능한 크기 |
| 짧은 답변 Q&A | 256-512 | 최대 한 문단 |
| 코드 함수 | 512-2048 | 함수 복잡도에 따라 |
| 블로그 글 | 2048-4096 | 장문 콘텐츠 |
| 전체 코드 파일 | 4096-8192 | 큰 출력 필요 |
| 확장 분석 | 4096-16000 | 상세한 다중 섹션 응답 |

### 잘림 함정

`max_tokens`가 너무 낮으면, 모델의 응답이 문장 중간에서 잘립니다. 이는 전체 호출을 낭비합니다 — 부분적이고 사용할 수 없는 응답에 비용을 지불한 것입니다. 해결법:

```python
# 응답이 잘렸는지 확인
if response.stop_reason == "max_tokens":
    # 응답이 잘림 — max_tokens를 늘리고 재시도
    print("Warning: Response truncated. Consider increasing max_tokens.")
```

**전략**: 보수적인 `max_tokens`로 시작하고, 잘림을 확인하고, 필요할 때만 늘리세요. 항상 "만약을 위해" 높게 설정하는 것보다 낫습니다.

## top_p: (대부분) 무시해야 할 파라미터

`top_p`(nucleus sampling)는 모델이 고려하는 토큰을 제어합니다. `top_p` 0.9는 모델이 확률 질량의 상위 90%에 있는 토큰만 고려한다는 뜻입니다.

솔직한 진실: **대부분의 사용 사례에서 `top_p`는 기본값(보통 1.0)으로 놔두고 temperature만 조정해야 합니다.** 두 파라미터가 비슷한 일을 하며, 둘 다 조정하면 예측 불가능한 상호작용이 발생합니다.

```python
# 단순: temperature만 사용
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.3,
    # top_p는 기본값으로
    messages=[{"role": "user", "content": prompt}]
)

# 복잡 (그리고 거의 더 낫지 않음): 둘 다 조정
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.7,
    top_p=0.9,  # 이제 상관된 두 노브를 동시에 돌리고 있음
    messages=[{"role": "user", "content": prompt}]
)
```

예외: 약간의 창의성은 유지하면서 정말 이상한 출력을 제거해야 한다면, `top_p=0.95`와 적당한 temperature 조합이 도움될 수 있습니다. 하지만 이건 예외적인 경우입니다.

## 모든 것을 합치기: 파라미터 레시피

일반적인 작업을 위한 바로 사용할 수 있는 파라미터 조합입니다:

### 레시피 1: 코드 생성

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0,
    "max_tokens": 2048,
    # top_p 오버라이드 없음
}
```

### 레시피 2: JSON 데이터 추출

```python
{
    "model": "claude-haiku-3-5-20241022",
    "temperature": 0,
    "max_tokens": 512,
}
```

### 레시피 3: 고객 지원 봇

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.3,
    "max_tokens": 1024,
}
```

### 레시피 4: 창의적 마케팅 카피

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.8,
    "max_tokens": 2048,
}
```

### 레시피 5: 기술 문서

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.1,
    "max_tokens": 4096,
}
```

### 레시피 6: 브레인스토밍 세션

```python
{
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.9,
    "max_tokens": 2048,
}
```

## 비용 영향: 실제 예시

하루 10,000건의 지원 티켓을 처리하는 분류기의 최적화 전후를 비교합니다:

**최적화 전:**
```python
# Sonnet 사용, 높은 max_tokens, 기본 temperature
model = "claude-sonnet-4-20250514"
max_tokens = 4096
temperature = 0.7
# 평균 출력: ~200 토큰 (쓸데없는 버퍼, 때때로 횡설수설)
# 일일 비용: 10,000 × 200 토큰 × $15/1M = $30/일
```

**최적화 후:**
```python
# Haiku 사용, 딱 맞는 max_tokens, temperature 0
model = "claude-haiku-3-5-20241022"
max_tokens = 32
temperature = 0
# 평균 출력: ~8 토큰 (카테고리만)
# 일일 비용: 10,000 × 8 토큰 × $4/1M = $0.32/일
```

동일한 분류 정확도로 **99% 비용 절감**입니다. 최적화 버전은 출력이 짧아서 완료도 더 빠릅니다.

## 고급: 동적 파라미터 조정

프로덕션 애플리케이션에서는 작업에 따라 파라미터를 동적으로 조정하는 것을 고려하세요:

```python
def get_params(task_type: str) -> dict:
    configs = {
        "classify": {"model": "claude-haiku-3-5-20241022", "temperature": 0, "max_tokens": 32},
        "extract":  {"model": "claude-haiku-3-5-20241022", "temperature": 0, "max_tokens": 512},
        "answer":   {"model": "claude-sonnet-4-20250514", "temperature": 0.2, "max_tokens": 1024},
        "write":    {"model": "claude-sonnet-4-20250514", "temperature": 0.6, "max_tokens": 4096},
        "create":   {"model": "claude-sonnet-4-20250514", "temperature": 0.8, "max_tokens": 2048},
    }
    return configs.get(task_type, configs["answer"])

# 사용법
params = get_params("classify")
response = client.messages.create(
    messages=[{"role": "user", "content": prompt}],
    **params
)
```

## 핵심 정리

1. **Temperature 0**은 코드, 추출, "정답"이 있는 모든 것에 사용하세요. 창의성은 창의적 작업에 아껴두세요.
2. **max_tokens를 각 작업에 맞게 조정하세요.** 모든 곳에 4096을 기본값으로 놔두지 마세요.
3. **top_p는 그대로 두세요.** 변경할 구체적인 이유가 없다면.
4. **모델을 작업에 맞추세요** — 파라미터 튜닝으로 Haiku가 Opus의 일을 하게 할 수는 없지만, Haiku로 충분한 곳에 Opus를 쓰지 않게 할 수 있습니다.
5. **모니터링하고 반복하세요** — 실제 출력 토큰 수를 로깅하고 max_tokens를 그에 맞게 조정하세요.

이 최적화는 API를 직접 호출하든, Claude Code를 사용하든, 어떤 LLM 프레임워크로 빌드하든 적용됩니다. API 비용 자체를 더 절약하고 싶다면, **Conduit AI**가 Claude와 GPT 모델을 위한 통합 게이트웨이를 공식 가격 대비 약 1/8(약 87% 절약)로 제공합니다. 구독 없이 사용량 기반 과금 — HK$50부터 충전 가능하고 가입 시 HK$5 무료 크레딧이 제공됩니다. OpenAI 호환 BASE URL을 받는 모든 도구에서 작동합니다.

---

**관련 글:**
- [Claude 전 모델 한눈에 보기: Haiku부터 Opus까지 활용 사례](/conduit-blog/ko/blog/claude-models-overview/)
- [Thinking 모델이 가치 있을 때 — 그리고 돈을 낭비할 때](/conduit-blog/ko/blog/thinking-model-worth-it/)
