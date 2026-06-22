---
title: "从 0 搭一个 AI 客服机器人：最省钱方案"
description: "面向中小团队和独立开发者，手把手教你用最低成本搭建一个 RAG 架构的 AI 问答机器人：文档切片→embedding→向量库→LLM 回答→部署上线。"
pubDate: 2026-06-22
draft: false
tags: ["AI 客服", "RAG", "chatbot", "向量数据库", "低成本"]
keywords: ["AI 客服机器人", "问答机器人搭建", "低成本 AI chatbot", "RAG 架构", "embedding"]
---

## 为什么自己搭比买 SaaS 便宜

市面上的 AI 客服 SaaS 产品动辄每月几百甚至几千块，对于中小团队和独立开发者来说，这笔钱花得心疼。但如果你有基本的开发能力，完全可以用 RAG（Retrieval-Augmented Generation）架构自己搭一个——核心成本就是 LLM API 调用费和向量数据库存储费，每月可能只需要几十块钱。

这篇文章带你从零走完全流程：文档准备 → 切片 → Embedding → 存入向量库 → LLM 回答 → 部署上线。

## 整体架构一览

先看整个系统的数据流：

```
用户提问
  ↓
[1] 将问题转为 embedding 向量
  ↓
[2] 在向量数据库中检索最相关的文档片段（top-k）
  ↓
[3] 将问题 + 检索到的上下文发给 LLM
  ↓
[4] LLM 生成回答
  ↓
返回给用户
```

核心组件和推荐方案：

| 组件 | 推荐方案（省钱优先） | 月成本估算 |
|------|-------------------|-----------|
| 文档切片 | LangChain / 自写脚本 | 免费 |
| Embedding 模型 | `text-embedding-3-small` | ~¥5-20 |
| 向量数据库 | Supabase pgvector / Qdrant | 免费-¥50 |
| LLM | Claude 3.5 Haiku / GPT-4o-mini | ~¥20-100 |
| 部署 | Vercel / Railway / 自有服务器 | 免费-¥50 |

**整体月成本：¥50-200 左右**，看你的请求量。

## 第一步：准备和切片文档

把你的知识库（FAQ 文档、产品手册、帮助中心文章）整理成文本，然后切成合适大小的片段。

### 为什么要切片？

LLM 的上下文窗口有限，而且塞太多内容会稀释重点、增加成本。切成 300-500 token 的小块，检索时只取最相关的几块，又准又省。

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

def load_and_split_docs(docs_dir: str) -> list[dict]:
    """加载文档目录并切片"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,       # 每块约 500 字符
        chunk_overlap=50,     # 块之间重叠 50 字符，避免语义断裂
        separators=["\n\n", "\n", "。", "；", " "]
    )

    chunks = []
    for filename in os.listdir(docs_dir):
        if not filename.endswith((".md", ".txt")):
            continue
        with open(os.path.join(docs_dir, filename), "r") as f:
            text = f.read()

        splits = splitter.split_text(text)
        for i, split in enumerate(splits):
            chunks.append({
                "text": split,
                "source": filename,
                "chunk_id": f"{filename}_{i}",
            })

    return chunks

chunks = load_and_split_docs("./knowledge_base")
print(f"共生成 {len(chunks)} 个文档片段")
```

**切片技巧**：
- FAQ 类文档：按问答对切，一个 Q&A 一块
- 长文章：按段落或小节切，保持语义完整
- 表格/列表：尽量保持在同一块内

## 第二步：生成 Embedding 并存入向量库

把每个文档片段转成向量，存到向量数据库里。这里用 OpenAI 的 `text-embedding-3-small` 模型——它便宜（$0.02 / 1M tokens）且效果够用。

```python
from openai import OpenAI
import numpy as np

openai_client = OpenAI()  # 需要设置 OPENAI_API_KEY

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """批量生成 embedding"""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=texts,
    )
    return [item.embedding for item in response.data]

# 批量处理，每次最多 100 条
batch_size = 100
all_embeddings = []
for i in range(0, len(chunks), batch_size):
    batch_texts = [c["text"] for c in chunks[i:i+batch_size]]
    embeddings = get_embeddings(batch_texts)
    all_embeddings.extend(embeddings)
    print(f"已处理 {min(i+batch_size, len(chunks))}/{len(chunks)}")
```

### 存入 Supabase pgvector（免费额度够用）

Supabase 提供免费的 PostgreSQL 数据库并支持 pgvector 扩展，对于小规模知识库来说完全够用：

```sql
-- 在 Supabase SQL 编辑器中执行
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT,
  chunk_id TEXT UNIQUE,
  embedding VECTOR(1536)  -- text-embedding-3-small 输出 1536 维
);

-- 创建索引加速检索
CREATE INDEX ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 插入文档和向量
for chunk, embedding in zip(chunks, all_embeddings):
    supabase.table("documents").insert({
        "content": chunk["text"],
        "source": chunk["source"],
        "chunk_id": chunk["chunk_id"],
        "embedding": embedding,
    }).execute()
```

## 第三步：检索 + LLM 回答

用户提问时，先把问题转成向量，检索最相关的文档片段，然后连同问题一起发给 LLM：

```python
import anthropic

claude_client = anthropic.Anthropic()

def answer_question(question: str, top_k: int = 3) -> str:
    """RAG 问答主流程"""

    # 1. 将问题转为 embedding
    q_embedding = get_embeddings([question])[0]

    # 2. 在向量库中检索最相关的片段
    result = supabase.rpc("match_documents", {
        "query_embedding": q_embedding,
        "match_count": top_k,
        "match_threshold": 0.7,  # 相似度阈值
    }).execute()

    if not result.data:
        return "抱歉，我在知识库中没有找到相关信息。请联系人工客服。"

    # 3. 拼接上下文
    context = "\n\n---\n\n".join([doc["content"] for doc in result.data])

    # 4. 发给 LLM 生成回答
    response = claude_client.messages.create(
        model="claude-3-5-haiku-20241022",  # 用 Haiku 省钱！
        max_tokens=500,
        temperature=0.2,  # 客服回答要准确
        system="""你是一个友好的客服助手。根据提供的知识库内容回答用户问题。
规则：
1. 只基于知识库内容回答，不要编造信息
2. 如果知识库中没有相关信息，诚实告知并建议联系人工客服
3. 回答简洁明了，使用友好的语气""",
        messages=[{
            "role": "user",
            "content": f"知识库内容：\n{context}\n\n用户问题：{question}"
        }]
    )

    return response.content[0].text
```

需要在 Supabase 中创建检索函数：

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 3,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (content TEXT, source TEXT, similarity FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.content,
    d.source,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## 第四步：加个 API 壳子部署上线

用 FastAPI 包一个 HTTP 接口，部署到 Vercel 或 Railway：

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Question(BaseModel):
    text: str

class Answer(BaseModel):
    answer: str
    sources: list[str]

@app.post("/ask", response_model=Answer)
async def ask(question: Question):
    result = answer_question(question.text)
    return Answer(
        answer=result,
        sources=[]  # 可以把来源也返回
    )
```

## 第五步：省钱的关键细节

搭完基本架构后，下面这些细节决定了你每月的实际开销：

1. **LLM 选型用 Haiku**：客服问答 90% 的情况 Haiku 就够了，成本是 Sonnet 的 1/4
2. **控制 max_tokens**：客服回答一般不超过 200 字，max_tokens 设 500 足够
3. **加缓存层**：用 Redis 缓存高频问题的答案，重复问题不调 API
4. **设相似度阈值**：检索结果相似度低于阈值就直接回复"找不到"，不浪费 LLM 调用
5. **Embedding 做一次就行**：文档不变就不需要重新 embedding，这是一次性成本

| 优化手段 | 预估节省 | 实施难度 |
|---------|---------|---------|
| 用 Haiku 替代 Sonnet | 70-80% | 低 |
| Redis 缓存高频问题 | 30-50% | 中 |
| 控制 max_tokens | 10-20% | 低 |
| 相似度阈值过滤 | 15-25% | 低 |

## 写在最后

一个基本能用的 AI 客服机器人，技术上并不复杂——文档切片、向量检索、LLM 回答，三步就跑通了。真正的挑战在于后续的持续优化：补充知识库、调整切片粒度、处理边界情况、加入人工兜底。

在 LLM API 这一环，如果你不想分别注册和充值 OpenAI、Anthropic 的账号，可以试试 **Conduit AI**——一个统一 LLM 网关，一个 BASE URL 同时接入 Claude 和 GPT 全系列（包括 Embedding 模型），按量付费没有订阅费，价格约为官方的 1/8（省约 87%），HK$50 起充还送 HK$5，支持支付宝和微信支付。对于需要同时用 Embedding 和 LLM 的 RAG 场景来说，只管一个 API 入口确实方便很多。

---

### 相关阅读

- [Claude 全系列模型一张图看懂：从 Haiku 到 Opus 怎么选](/conduit-blog/blog/claude-models-overview/)
- [thinking 模型什么时候值得用、什么时候纯烧钱](/conduit-blog/blog/thinking-model-worth-it/)
- [temperature / max_tokens 实战调参指南](/conduit-blog/blog/temperature-max-tokens-guide/)
