---
title: "AI 고객지원 봇을 처음부터 만들기 — 최소 비용 버전"
description: "소규모 팀과 1인 개발자를 위한 단계별 가이드. 스마트한 모델 선택과 토큰 최적화로 최소 비용의 AI 고객지원 챗봇을 만듭니다."
pubDate: 2026-06-22
draft: false
tags: ["챗봇", "AI 고객지원", "저예산", "튜토리얼", "소규모 팀"]
keywords: ["AI support bot", "chatbot build", "budget AI chatbot"]
---

## 엔터프라이즈급 봇에 엔터프라이즈 요금은 필요 없습니다

하나의 미신을 깨뜨리겠습니다: 제대로 작동하는 고객지원 챗봇을 만드는 데 월 $500짜리 AI 플랫폼이 필요하지 않습니다. 올바른 아키텍처만 있으면, 1인 개발자나 소규모 팀이 월 $20 미만으로 하루 수백 건의 대화를 처리하는 프로덕션급 AI 지원 봇을 만들 수 있습니다.

이 가이드는 제로에서 작동하는 봇까지의 가장 저렴한 경로를 안내합니다. 허울뿐인 내용이나 "이 SaaS를 쓰면 됩니다" 같은 지름길 없이, 직접 만들고, 모든 부분을 이해하고, 토큰 단위로 비용을 관리합니다.

## 아키텍처 개요: 저예산 스택

만들 것의 전체 그림입니다:

```
사용자 → 채팅 위젯 → API 서버 → LLM API → 응답
                          ↓
                    지식 베이스
                    (마크다운 파일)
```

**스택 선택 (모두 무료 또는 거의 무료):**

| 구성 요소 | 선택 | 비용 |
|---|---|---|
| 프론트엔드 위젯 | 기성 채팅 컴포넌트 또는 커스텀 HTML | 무료 |
| API 서버 | Node.js / Python (아무 호스팅) | 무료 티어 가능 |
| LLM API | Claude Haiku (API 게이트웨이 경유) | ~$5-15/월 |
| 지식 베이스 | 폴더 안의 마크다운 파일 | 무료 |
| 호스팅 | Vercel / Railway / Fly.io 무료 티어 | 무료 |
| 벡터 DB (선택) | SQLite + 임베딩 | 무료 |

총 인프라 비용: 볼륨에 따라 **월 $0~15**. 실제 비용은 LLM 토큰뿐입니다.

## 1단계: 지식 베이스 구축

AI를 건드리기 전에, 봇이 알아야 할 내용을 정리하세요. `knowledge/` 디렉토리를 만듭니다:

```
knowledge/
├── faq.md
├── pricing.md
├── getting-started.md
├── troubleshooting.md
├── refund-policy.md
└── api-docs.md
```

각 파일은 명확한 헤딩으로 구조화되어야 합니다:

```markdown
# Pricing

## Free Plan
- Up to 100 API calls/day
- 1 project
- Community support

## Pro Plan ($29/month)
- Unlimited API calls
- 10 projects
- Priority email support
- Custom domain

## Common pricing questions

### Can I switch plans?
Yes, you can upgrade or downgrade at any time. Changes take effect immediately.
Downgrade refunds are prorated.

### Is there a student discount?
Yes! Email support@example.com with your .edu address for 50% off Pro.
```

이것이 봇의 두뇌입니다. 잘 구조화된 문서 = 더 나은 답변. 정리가 안 된 문서 = 혼란스러운 봇.

## 2단계: 간단한 RAG 파이프라인 구축

RAG(Retrieval-Augmented Generation)는 "먼저 관련 문서를 찾고, 그것을 기반으로 LLM에게 답변을 요청하는 것"을 의미합니다. 최소한의 구현입니다:

```javascript
// knowledge-loader.js
import fs from 'fs';
import path from 'path';

function loadKnowledgeBase(dir) {
  const docs = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    
    // ## 헤딩 기준으로 분할하여 세분화된 검색
    const sections = content.split(/^## /m).filter(Boolean);
    
    for (const section of sections) {
      const title = section.split('\n')[0].trim();
      docs.push({
        title,
        content: section.trim(),
        source: file
      });
    }
  }
  
  return docs;
}

export const knowledgeBase = loadKnowledgeBase('./knowledge');
```

검색 단계에서는 간단한 키워드 매칭으로 시작하세요. 첫날부터 벡터 데이터베이스가 필요하지 않습니다:

```javascript
// search.js
function searchKnowledge(query, docs, topK = 3) {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const scored = docs.map(doc => {
    const text = (doc.title + ' ' + doc.content).toLowerCase();
    let score = 0;
    
    for (const word of queryWords) {
      if (word.length < 3) continue; // 짧은 단어 건너뛰기
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      score += matches ? matches.length : 0;
    }
    
    // 제목 매치 부스트
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) score += 5;
    }
    
    return { ...doc, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(d => d.score > 0);
}

export { searchKnowledge };
```

키워드 검색이 임베딩만큼 좋은가요? 아닙니다. 20~50개 문서로 구성된 집중된 지식 베이스에서 95%만큼 좋은가요? 네. 그리고 토큰 비용은 0입니다.

## 3단계: LLM 연결

이제 채팅 엔드포인트를 만듭니다. 여기서 스마트한 프롬프트 엔지니어링이 비용을 절약합니다:

```javascript
// chat.js
import Anthropic from '@anthropic-ai/sdk';
import { knowledgeBase } from './knowledge-loader.js';
import { searchKnowledge } from './search.js';

const client = new Anthropic({
  baseURL: process.env.API_BASE_URL,  // API 게이트웨이
  apiKey: process.env.API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful support assistant for [Your Product].
Rules:
- Answer ONLY based on the provided context. If the context doesn't contain the answer, say "I don't have information about that. Let me connect you with our team."
- Keep responses under 150 words unless the question requires a detailed explanation.
- Use a friendly, professional tone.
- If the user seems frustrated, acknowledge their frustration before answering.
- Never make up features, pricing, or policies.
- Format responses with short paragraphs, not walls of text.`;

async function chat(userMessage, conversationHistory = []) {
  // 1단계: 관련 지식 검색
  const relevant = searchKnowledge(userMessage, knowledgeBase, 3);
  
  const context = relevant.length > 0
    ? relevant.map(d => `### ${d.title}\n${d.content}`).join('\n\n')
    : 'No relevant documentation found.';

  // 2단계: 컨텍스트를 포함한 프롬프트 구성
  const messages = [
    ...conversationHistory,
    {
      role: 'user',
      content: `Context from our documentation:\n${context}\n\n---\nCustomer question: ${userMessage}`
    }
  ];

  // 3단계: 최적화된 파라미터로 LLM 호출
  const response = await client.messages.create({
    model: 'claude-haiku-3-5-20241022',  // 가장 저렴한 모델 — 지원에 훌륭
    max_tokens: 512,                      // 간결한 응답 유지
    temperature: 0.2,                     // 낮은 창의성, 높은 일관성
    system: SYSTEM_PROMPT,
    messages: messages,
  });

  return response.content[0].text;
}

export { chat };
```

### 왜 Haiku인가?

Haiku는 비용 최적화의 주인공입니다. 지원 봇에 필요한 것:
- 빠른 응답 (Haiku가 가장 빠름)
- 일관된 톤 (낮은 temperature가 도움)
- 제공된 컨텍스트 기반의 사실 정확성 (Haiku가 이것에 뛰어남)
- 대화당 낮은 비용

전형적인 지원 대화는 메시지당 ~2,000 입력 토큰과 ~300 출력 토큰을 사용합니다. Haiku로:
- 메시지당 비용: ~$0.0028
- 5개 메시지 대화 비용: ~$0.014
- 하루 100건 대화 비용: ~$1.40/일 ≈ **월 ~$42**

API 게이트웨이로 1/8 가격 적용 시: **월 ~$5**. 24/7 지원 에이전트로는 놀라울 정도로 저렴합니다.

## 4단계: API 엔드포인트 추가

```javascript
// server.js
import express from 'express';
import { chat } from './chat.js';

const app = express();
app.use(express.json());

// 인메모리 대화 저장소 (프로덕션에서는 Redis 사용)
const conversations = new Map();

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'message and sessionId required' });
  }
  
  // 대화 히스토리 가져오기 또는 생성
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  const history = conversations.get(sessionId);
  
  try {
    const reply = await chat(message, history);
    
    // 히스토리 업데이트 (토큰 사용량 관리를 위해 최근 10개 메시지만 유지)
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: reply });
    
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      reply: "I'm having trouble right now. Please try again or email support@example.com." 
    });
  }
});

app.listen(3000, () => console.log('Support bot running on :3000'));
```

## 5단계: 비용 관리 가드레일

저예산 봇에는 예산 보호가 필요합니다. 다음 안전장치를 추가하세요:

```javascript
// rate-limiter.js
const rateLimits = new Map();

function checkRateLimit(sessionId, maxPerMinute = 5, maxPerDay = 50) {
  const now = Date.now();
  
  if (!rateLimits.has(sessionId)) {
    rateLimits.set(sessionId, { minute: [], day: [] });
  }
  
  const limits = rateLimits.get(sessionId);
  
  // 오래된 항목 정리
  limits.minute = limits.minute.filter(t => now - t < 60_000);
  limits.day = limits.day.filter(t => now - t < 86_400_000);
  
  if (limits.minute.length >= maxPerMinute) {
    return { allowed: false, reason: 'Please slow down. Try again in a minute.' };
  }
  
  if (limits.day.length >= maxPerDay) {
    return { allowed: false, reason: 'Daily limit reached. Email support@example.com for more help.' };
  }
  
  limits.minute.push(now);
  limits.day.push(now);
  return { allowed: true };
}
```

또한 월간 하드 예산 알림을 설정하세요. 대부분의 API 게이트웨이(및 Anthropic 콘솔)에서 지출 한도를 설정할 수 있습니다. 프로덕션 전에 꼭 하세요.

## 6단계: 에스컬레이션 경로

좋은 지원 봇은 언제 사람에게 넘겨야 하는지 압니다. 에스컬레이션 트리거를 추가하세요:

```javascript
const ESCALATION_TRIGGERS = [
  'speak to a human',
  'talk to someone',
  'real person',
  'cancel my account',
  'legal',
  'lawyer',
  'refund',  // 정책에 따라
];

function shouldEscalate(message) {
  const lower = message.toLowerCase();
  return ESCALATION_TRIGGERS.some(trigger => lower.includes(trigger));
}

// 채팅 핸들러에서:
if (shouldEscalate(message)) {
  return res.json({ 
    reply: "I understand you'd like to speak with our team directly. Let me connect you — someone will respond within 2 hours.",
    escalated: true 
  });
}
```

## 나중에 업그레이드: 성장 경로

이 저예산 스택으로 시작하고, 볼륨이 커지면 구성 요소를 업그레이드하세요:

| 볼륨 | 업그레이드 | 비용 영향 |
|---|---|---|
| 100+ 대화/일 | 세션 저장에 Redis 추가 | +$5/월 |
| 500+ 대화/일 | 키워드 검색을 임베딩으로 전환 | +$10/월 |
| 1000+ 대화/일 | 반복 질문에 캐싱 추가 | 비용 20-30% 절감 |
| 5000+ 대화/일 | 복잡한 티켓에 Sonnet, 단순한 것에 Haiku | +$50/월 |

직접 만드는 것의 장점은 각 업그레이드가 점진적이라는 것입니다. 수익을 확대하기 전에 비용을 확대하도록 강제하는 플랫폼에 종속되지 않습니다.

AI 지원 봇을 만드는 것은 올바른 모델과 파라미터 선택으로 LLM 비용이 얼마나 빠르게 관리 가능해지는지 보는 최고의 방법 중 하나입니다. 처음부터 비용을 최소화하고 싶다면, **Conduit AI**는 모든 Claude 및 GPT 모델을 하나의 BASE URL로 공식 가격 대비 약 1/8에 제공합니다 — 예산이 중요한 프로젝트에 안성맞춤입니다. 구독 없이 HK$50부터 사용량 기반 과금이며, 가입 시 HK$5 무료 크레딧으로 오늘 바로 봇을 가동할 수 있습니다.

---

**관련 글:**
- [최상위 모델을 저렴하게 쓰는 3가지 방법](/conduit-blog/ko/blog/low-cost-top-models/)
- [Claude 전 모델 한눈에 보기: Haiku부터 Opus까지 활용 사례](/conduit-blog/ko/blog/claude-models-overview/)
