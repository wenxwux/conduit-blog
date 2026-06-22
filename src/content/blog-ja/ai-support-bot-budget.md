---
title: "ゼロから作る AI カスタマーサポートボット：最もコスパの良い方法"
description: "中小チームや個人開発者向けに、最低コストで RAG アーキテクチャの AI Q&A ボットを構築する方法を手順付きで解説：ドキュメント分割→embedding→ベクトルDB→LLM 回答→デプロイ。"
pubDate: 2026-06-22
draft: false
tags: ["AI カスタマーサポート", "RAG", "chatbot", "ベクトルデータベース", "低コスト"]
keywords: ["AI カスタマーサポートボット", "Q&A ボット構築", "低コスト AI chatbot", "RAG アーキテクチャ", "embedding"]
---

## SaaS を買うより自分で作る方が安い理由

市販の AI カスタマーサポート SaaS 製品は月額数百から数千円かかることも珍しくなく、中小チームや個人開発者にとっては厳しい出費です。しかし基本的な開発能力があれば、RAG（Retrieval-Augmented Generation）アーキテクチャで自作できます——核心コストは LLM API の呼び出し料金とベクトルデータベースのストレージ料だけで、月額数十元程度で済む可能性があります。

この記事ではゼロから全工程を歩みます：ドキュメント準備 → 分割 → Embedding → ベクトルDB格納 → LLM 回答 → デプロイ。

## 全体アーキテクチャ概観

まずシステム全体のデータフローを確認：

```
ユーザーの質問
  ↓
[1] 質問を embedding ベクトルに変換
  ↓
[2] ベクトルデータベースで最も関連性の高いドキュメント断片を検索（top-k）
  ↓
[3] 質問 + 検索されたコンテキストを LLM に送信
  ↓
[4] LLM が回答を生成
  ↓
ユーザーに返答
```

コアコンポーネントと推奨方案：

| コンポーネント | 推奨方案（コスト優先） | 月コスト見積もり |
|------|-------------------|-----------|
| ドキュメント分割 | LangChain / 自作スクリプト | 無料 |
| Embedding モデル | `text-embedding-3-small` | ~¥5-20 |
| ベクトルデータベース | Supabase pgvector / Qdrant | 無料〜¥50 |
| LLM | Claude 3.5 Haiku / GPT-4o-mini | ~¥20-100 |
| デプロイ | Vercel / Railway / 自前サーバー | 無料〜¥50 |

**全体月コスト：¥50〜200 程度**、リクエスト量による。

## ステップ1：ドキュメントの準備と分割

ナレッジベース（FAQ ドキュメント、製品マニュアル、ヘルプセンター記事）をテキストに整理し、適切なサイズの断片に分割します。

### なぜ分割が必要か？

LLM のコンテキストウィンドウには限りがあり、大量のコンテンツを詰め込むとポイントが薄まりコストも増加します。300〜500 token の小さなブロックに分割し、検索時に最も関連性の高いブロックだけを取得すれば、正確かつ節約できます。

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

def load_and_split_docs(docs_dir: str) -> list[dict]:
    """ドキュメントディレクトリを読み込み分割"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,       # 各ブロック約 500 文字
        chunk_overlap=50,     # ブロック間 50 文字重複、意味の断裂を防止
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
print(f"合計 {len(chunks)} 個のドキュメント断片を生成")
```

**分割のコツ**：
- FAQ 系ドキュメント：Q&A ペアごとに分割、1つの Q&A で1ブロック
- 長い記事：段落や小節ごとに分割、意味の完全性を保持
- 表/リスト：できるだけ同じブロック内に収める

## ステップ2：Embedding の生成とベクトルDB格納

各ドキュメント断片をベクトルに変換し、ベクトルデータベースに格納します。ここでは OpenAI の `text-embedding-3-small` モデルを使用——安価（$0.02 / 1M tokens）で効果は十分。

```python
from openai import OpenAI
import numpy as np

openai_client = OpenAI()  # OPENAI_API_KEY の設定が必要

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """バッチで embedding を生成"""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=texts,
    )
    return [item.embedding for item in response.data]

# バッチ処理、一度に最大 100 件
batch_size = 100
all_embeddings = []
for i in range(0, len(chunks), batch_size):
    batch_texts = [c["text"] for c in chunks[i:i+batch_size]]
    embeddings = get_embeddings(batch_texts)
    all_embeddings.extend(embeddings)
    print(f"処理済み {min(i+batch_size, len(chunks))}/{len(chunks)}")
```

### Supabase pgvector に格納（無料枠で十分）

Supabase は無料の PostgreSQL データベースを提供し、pgvector 拡張をサポート。小規模ナレッジベースには十分です：

```sql
-- Supabase SQL エディタで実行
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT,
  chunk_id TEXT UNIQUE,
  embedding VECTOR(1536)  -- text-embedding-3-small は 1536 次元出力
);

-- インデックス作成で検索を高速化
CREATE INDEX ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ドキュメントとベクトルを挿入
for chunk, embedding in zip(chunks, all_embeddings):
    supabase.table("documents").insert({
        "content": chunk["text"],
        "source": chunk["source"],
        "chunk_id": chunk["chunk_id"],
        "embedding": embedding,
    }).execute()
```

## ステップ3：検索 + LLM 回答

ユーザーが質問した際、まず質問をベクトルに変換し、最も関連性の高いドキュメント断片を検索してから、質問と一緒に LLM に送ります：

```python
import anthropic

claude_client = anthropic.Anthropic()

def answer_question(question: str, top_k: int = 3) -> str:
    """RAG Q&A メインフロー"""

    # 1. 質問を embedding に変換
    q_embedding = get_embeddings([question])[0]

    # 2. ベクトルDBで最も関連性の高い断片を検索
    result = supabase.rpc("match_documents", {
        "query_embedding": q_embedding,
        "match_count": top_k,
        "match_threshold": 0.7,  # 類似度しきい値
    }).execute()

    if not result.data:
        return "申し訳ございません。ナレッジベースに関連情報が見つかりませんでした。有人サポートにお問い合わせください。"

    # 3. コンテキストを結合
    context = "\n\n---\n\n".join([doc["content"] for doc in result.data])

    # 4. LLM に送って回答を生成
    response = claude_client.messages.create(
        model="claude-3-5-haiku-20241022",  # Haiku で節約！
        max_tokens=500,
        temperature=0.2,  # カスタマーサポートの回答は正確性重視
        system="""あなたは親切なカスタマーサポートアシスタントです。提供されたナレッジベースの内容に基づいてユーザーの質問に回答してください。
ルール：
1. ナレッジベースの内容のみに基づいて回答し、情報を捏造しない
2. ナレッジベースに関連情報がない場合は正直に伝え、有人サポートへの連絡を提案
3. 簡潔明瞭に回答し、フレンドリーな口調を使用""",
        messages=[{
            "role": "user",
            "content": f"ナレッジベース内容：\n{context}\n\nユーザーの質問：{question}"
        }]
    )

    return response.content[0].text
```

Supabase に検索関数を作成する必要があります：

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

## ステップ4：API ラッパーを付けてデプロイ

FastAPI で HTTP インターフェースを包み、Vercel や Railway にデプロイ：

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
        sources=[]  # ソースも返せる
    )
```

## ステップ5：節約の鍵となるディテール

基本アーキテクチャ完成後、以下のディテールが実際の月額コストを決定します：

1. **LLM は Haiku を選択**：カスタマーサポート Q&A の 90% は Haiku で十分、コストは Sonnet の 1/4
2. **max_tokens を制御**：サポート回答は通常 200 文字以内、max_tokens は 500 で十分
3. **キャッシュ層を追加**：Redis で高頻度質問の回答をキャッシュ、繰り返し質問で API を呼ばない
4. **類似度しきい値を設定**：検索結果の類似度がしきい値以下なら「見つかりません」と即答し、LLM 呼び出しを節約
5. **Embedding は一度だけ**：ドキュメントが変わらなければ再 embedding 不要、一回限りのコスト

| 最適化手段 | 推定削減 | 実施難易度 |
|---------|---------|---------|
| Haiku で Sonnet を代替 | 70-80% | 低 |
| Redis で高頻度質問をキャッシュ | 30-50% | 中 |
| max_tokens 制御 | 10-20% | 低 |
| 類似度しきい値フィルタリング | 15-25% | 低 |

## おわりに

基本的に使える AI カスタマーサポートボットは、技術的には複雑ではありません——ドキュメント分割、ベクトル検索、LLM 回答の3ステップで動きます。真のチャレンジはその後の継続的な最適化：ナレッジベースの補充、分割粒度の調整、エッジケースの処理、人間によるフォールバックの追加です。

LLM API の部分で、OpenAI と Anthropic のアカウントを個別に登録・チャージしたくない方は、**Conduit AI** を試してみてください。統一 LLM API ゲートウェイとして、1つの BASE URL で Claude と GPT 全シリーズ（Embedding モデル含む）に同時接続、従量課金でサブスクリプション不要、価格は約 1/8（約 87% 節約）、HK$50 から利用開始で HK$5 プレゼント、Alipay・WeChat Pay・クレジットカード対応。Embedding と LLM を同時に使う RAG シナリオでは、API 入口が1つで済むのは確実に便利です。

---

### 関連記事

- [Claude 全モデルシリーズを一目で理解：Haiku から Opus までの選び方](/conduit-blog/ja/blog/claude-models-overview/)
- [thinking モデルはいつ使う価値がある？いつお金の無駄？](/conduit-blog/ja/blog/thinking-model-worth-it/)
- [temperature / max_tokens 実践パラメータ調整ガイド](/conduit-blog/ja/blog/temperature-max-tokens-guide/)
