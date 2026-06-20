---
title: "Claude Code 빠른 시작: 설치부터 첫 AI 코드 수정까지"
description: "Claude Code를 설치·설정하고, 첫 AI 코드 수정을 실행하며, BASE URL / API 키를 구성하는 실전 가이드. 자주 발생하는 오류 해결법까지 함께 다룹니다."
pubDate: 2026-06-19
tags: ["Claude Code", "튜토리얼", "시작하기"]
keywords: ["Claude Code 설정", "Claude Code 튜토리얼", "BASE URL 구성"]
draft: false
---

대부분의 사람에게 Claude Code를 시작할 때 가장 어려운 부분은 *사용법*이 아니라 **연결하는 것**입니다. 키를 어디에 넣어야 하는지, BASE URL은 어떻게 설정하는지, 첫 실행에서 왜 오류가 나는지 말이죠. 이 가이드는 전체 과정을 단계별로 안내하여, 약 5분 안에 AI가 여러분의 코드를 수정하도록 만들어 줍니다.

## 1. Claude Code 설치하기

Claude Code는 CLI 도구입니다. 설치는 명령어 하나면 됩니다.

```bash
npm install -g @anthropic-ai/claude-code
```

설치 후 `claude --version`을 실행해 보세요. 버전 번호가 보이면 정상입니다.

## 2. 접속 설정하기 (핵심 단계)

Claude Code가 작동하려면 두 가지가 필요합니다. **API 키**와 **BASE URL**입니다.

가장 흔한 설정 방식은 환경 변수입니다.

```bash
export ANTHROPIC_AUTH_TOKEN="your-key"
export ANTHROPIC_BASE_URL="your-endpoint-url"
```

> 팁: 이 두 줄을 `~/.zshrc` 또는 `~/.bashrc`에 추가해 두면, 새 터미널을 열 때마다 자동으로 불러옵니다.

## 3. 첫 AI 코드 수정

아무 프로젝트 디렉터리로 들어가 다음을 실행하세요.

```bash
claude
```

그리고 원하는 작업을 평범한 말로 설명하면 됩니다. 예를 들어:

> "utils.js에서 모든 `var`를 `const`로 바꾸고 짧은 주석을 추가해 줘."

Claude Code는 파일을 읽고, 변경 사항을 제안한 다음, 여러분이 확인하면 다시 파일에 반영합니다. 여러분이 할 일은 검토하고 승인하는 것뿐입니다.

## 4. 자주 발생하는 오류

| 증상 | 가능한 원인 | 해결법 |
|---|---|---|
| `401 Unauthorized` | 키가 잘못되었거나 설정되지 않음 | 키 값과 환경 변수가 export 되었는지 확인 |
| 타임아웃 / 응답 없음 | BASE URL 오류 또는 네트워크 문제 | URL 철자 확인, 끝에 슬래시 없도록 |
| Model not found | 모델 이름 오류 | 제공자가 지원하는 모델 이름 사용 |

## 마무리

연결은 결국 두 가지로 귀결됩니다. **올바른 키**와 **올바른 BASE URL**입니다. 이 두 가지만 설정되면 Claude Code는 여러분의 코드를 읽고 명령에 따라 수정해 주는 어시스턴트가 됩니다. 처음에는 작은 변경부터 시작해 확인 과정에 익숙해진 뒤, 더 큰 작업을 맡겨 보세요.

---

Claude(그리고 GPT 등)를 하나의 엔드포인트로 사용하고 싶다면, **Conduit AI**는 통합 LLM API 게이트웨이입니다. 하나의 BASE URL, 사용량 기반 과금(공식 가격의 약 1/8, 약 87% 절약), 구독 없음. Claude Code와 즉시 호환되며, `ANTHROPIC_BASE_URL`만 가리키면 됩니다. HK$50부터 충전 가능, 가입 시 HK$5 증정, 알리페이·위챗·신용카드 결제 지원. 공식 사이트: https://conduitai.slateatelier.com
