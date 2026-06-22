---
title: "Build an AI Support Bot from Scratch — The Budget Way"
description: "A step-by-step guide for small teams and solo developers to build a working AI-powered support chatbot at the lowest possible cost, using smart model selection and token optimization."
pubDate: 2026-06-22
draft: false
tags: ["chatbot", "AI support", "budget", "tutorial", "small teams"]
keywords: ["AI support bot", "chatbot build", "budget AI chatbot"]
---

## You Don't Need Enterprise Pricing for an Enterprise-Quality Bot

Let's kill a myth: you don't need a $500/month AI platform to build a support chatbot that actually works. With the right architecture, a solo developer or small team can build a production-grade AI support bot for under $20/month — handling hundreds of conversations per day.

This guide walks you through the cheapest path from zero to a working bot. No fluff, no "just use this SaaS" shortcuts. You'll build it yourself, understand every piece, and control your costs down to the token.

## Architecture Overview: The Budget Stack

Here's what we're building:

```
User → Chat Widget → Your API Server → LLM API → Response
                          ↓
                    Knowledge Base
                    (Markdown files)
```

**Stack choices (all free or near-free):**

| Component | Choice | Cost |
|---|---|---|
| Frontend widget | Prebuilt chat component or custom HTML | Free |
| API server | Node.js / Python (any hosting) | Free tier available |
| LLM API | Claude Haiku via API gateway | ~$5-15/month |
| Knowledge base | Markdown files in a folder | Free |
| Hosting | Vercel / Railway / Fly.io free tier | Free |
| Vector DB (optional) | SQLite with embeddings | Free |

Total infrastructure cost: **$0-15/month** depending on volume. The only real cost is LLM tokens.

## Step 1: Set Up Your Knowledge Base

Before touching any AI, organize what your bot will know. Create a `knowledge/` directory:

```
knowledge/
├── faq.md
├── pricing.md
├── getting-started.md
├── troubleshooting.md
├── refund-policy.md
└── api-docs.md
```

Each file should be structured with clear headings:

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

This is your bot's brain. Well-structured docs = better answers. Poorly organized docs = confused bot.

## Step 2: Build the Simple RAG Pipeline

RAG (Retrieval-Augmented Generation) means "find relevant docs first, then ask the LLM to answer based on them." Here's a minimal implementation:

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
    
    // Split by ## headings for granular retrieval
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

For the search step, start with simple keyword matching. You don't need a vector database on day one:

```javascript
// search.js
function searchKnowledge(query, docs, topK = 3) {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const scored = docs.map(doc => {
    const text = (doc.title + ' ' + doc.content).toLowerCase();
    let score = 0;
    
    for (const word of queryWords) {
      if (word.length < 3) continue; // skip tiny words
      const regex = new RegExp(word, 'g');
      const matches = text.match(regex);
      score += matches ? matches.length : 0;
    }
    
    // Boost title matches
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

Is keyword search as good as embeddings? No. Is it 95% as good for a focused knowledge base with 20-50 documents? Absolutely. And it costs zero tokens.

## Step 3: Wire Up the LLM

Now create the chat endpoint. This is where smart prompt engineering saves you money:

```javascript
// chat.js
import Anthropic from '@anthropic-ai/sdk';
import { knowledgeBase } from './knowledge-loader.js';
import { searchKnowledge } from './search.js';

const client = new Anthropic({
  baseURL: process.env.API_BASE_URL,  // Your API gateway
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
  // Step 1: Find relevant knowledge
  const relevant = searchKnowledge(userMessage, knowledgeBase, 3);
  
  const context = relevant.length > 0
    ? relevant.map(d => `### ${d.title}\n${d.content}`).join('\n\n')
    : 'No relevant documentation found.';

  // Step 2: Build the prompt with context
  const messages = [
    ...conversationHistory,
    {
      role: 'user',
      content: `Context from our documentation:\n${context}\n\n---\nCustomer question: ${userMessage}`
    }
  ];

  // Step 3: Call the LLM with optimized parameters
  const response = await client.messages.create({
    model: 'claude-haiku-3-5-20241022',  // Cheapest model — great for support
    max_tokens: 512,                      // Keep responses concise
    temperature: 0.2,                     // Low creativity, high consistency
    system: SYSTEM_PROMPT,
    messages: messages,
  });

  return response.content[0].text;
}

export { chat };
```

### Why Haiku?

Haiku is the cost optimization hero. For a support bot, you need:
- Fast responses (Haiku is the fastest)
- Consistent tone (low temperature helps)
- Factual accuracy from provided context (Haiku excels at this)
- Low cost per conversation

A typical support conversation uses ~2,000 input tokens and ~300 output tokens per message. With Haiku:
- Cost per message: ~$0.0028
- Cost for a 5-message conversation: ~$0.014
- Cost for 100 conversations/day: ~$1.40/day ≈ **$42/month**

With an API gateway at 1/8 price: **~$5/month**. That's absurdly cheap for a 24/7 support agent.

## Step 4: Add the API Endpoint

```javascript
// server.js
import express from 'express';
import { chat } from './chat.js';

const app = express();
app.use(express.json());

// In-memory conversation store (use Redis in production)
const conversations = new Map();

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'message and sessionId required' });
  }
  
  // Get or create conversation history
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  const history = conversations.get(sessionId);
  
  try {
    const reply = await chat(message, history);
    
    // Update history (keep last 10 messages to control token usage)
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

## Step 5: Cost Control Guardrails

Budget bots need budget protection. Add these safeguards:

```javascript
// rate-limiter.js
const rateLimits = new Map();

function checkRateLimit(sessionId, maxPerMinute = 5, maxPerDay = 50) {
  const now = Date.now();
  
  if (!rateLimits.has(sessionId)) {
    rateLimits.set(sessionId, { minute: [], day: [] });
  }
  
  const limits = rateLimits.get(sessionId);
  
  // Clean old entries
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

Also, set a hard monthly budget alert. Most API gateways (and Anthropic's console) let you set spending limits. Do this before going to production.

## Step 6: The Escalation Path

A good support bot knows when to hand off to a human. Add escalation triggers:

```javascript
const ESCALATION_TRIGGERS = [
  'speak to a human',
  'talk to someone',
  'real person',
  'cancel my account',
  'legal',
  'lawyer',
  'refund',  // depending on your policy
];

function shouldEscalate(message) {
  const lower = message.toLowerCase();
  return ESCALATION_TRIGGERS.some(trigger => lower.includes(trigger));
}

// In your chat handler:
if (shouldEscalate(message)) {
  return res.json({ 
    reply: "I understand you'd like to speak with our team directly. Let me connect you — someone will respond within 2 hours.",
    escalated: true 
  });
}
```

## Upgrading Later: The Growth Path

Start with this budget stack, then upgrade components as volume grows:

| Volume | Upgrade | Cost Impact |
|---|---|---|
| 100+ conversations/day | Add Redis for session storage | +$5/month |
| 500+ conversations/day | Switch keyword search to embeddings | +$10/month |
| 1000+ conversations/day | Add caching for repeated questions | Reduces cost 20-30% |
| 5000+ conversations/day | Upgrade to Sonnet for complex tickets, keep Haiku for simple ones | +$50/month |

The beauty of building it yourself is that each upgrade is incremental. You're never locked into a platform that forces you to scale costs before you scale revenue.

Building an AI support bot is one of the best ways to see how quickly LLM costs can become manageable with the right model and parameter choices. If you want to minimize those costs from day one, **Conduit AI** gives you access to all Claude and GPT models through a single BASE URL at ~1/8 the official price — perfect for budget-conscious projects. No subscription, pay-as-you-go from HK$50, and HK$5 free credit to get your bot running today.

---

**Related reading:**
- [3 Ways to Use Top Models on a Budget](/conduit-blog/en/blog/low-cost-top-models/)
- [Every Claude Model in One Chart: Haiku to Opus Use Cases](/conduit-blog/en/blog/claude-models-overview/)
