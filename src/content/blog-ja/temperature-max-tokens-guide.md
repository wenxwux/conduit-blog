---
title: "temperature / max_tokens 実践パラメータ調整ガイド：デフォルト値を使うのはもうやめよう"
description: "API を呼び出す開発者向けに、temperature、max_tokens、top_p などのコアパラメータの調整方法を解説。シナリオ別推奨値の早見表付き。"
pubDate: 2026-06-22
draft: false
tags: ["LLM パラメータ", "temperature", "max_tokens", "パラメータ調整", "API"]
keywords: ["temperature 調整", "max_tokens 設定", "LLM パラメータチューニング", "top_p", "API パラメータ調整ガイド"]
---

## なぜデフォルトパラメータでは不十分なのか

多くの開発者は LLM API を呼び出す際、パラメータをすべてデフォルトにしてしまいます——temperature を設定せず、max_tokens を最大に。結果として、生成内容が「お堅すぎて」創造性に欠けたり、逆に「飛びすぎて」でたらめを言ったり、毎回のリクエストで大量の不要な token を消費したりします。

LLM のコアパラメータは数個しかありませんが、適切に調整すれば同じモデルがシナリオごとに全く別物の性能を発揮します。この記事では最重要パラメータを完全に理解し、そのまま使える推奨値を提供します。

## コアパラメータ詳解

### temperature：「創造性」の制御

`temperature` はモデル出力のランダム性を制御し、取値範囲は通常 0〜1（一部 API は 2 まで対応）。

- **temperature = 0**：毎回最も確率の高い token を選択し、出力はほぼ決定論的。正確で一貫した結果が必要なタスクに適します。
- **temperature = 0.5-0.7**：決定性と多様性のバランスを取り、ほとんどの汎用タスクのスイートスポット。
- **temperature = 1.0+**：出力がよりランダムで「クリエイティブ」になりますが、脱線しやすくなります。

```python
import anthropic

client = anthropic.Anthropic()

# 正確な分類タスク：temperature を低く設定
classification = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=20,
    temperature=0,  # 確定的な結果が必要
    messages=[{
        "role": "user",
        "content": "このレビューを [ポジティブ/ネガティブ/ニュートラル] に分類してください：'この店のサービスはまあまあだけど、料理が高すぎる'"
    }]
)

# クリエイティブライティング：temperature を適度に上げる
creative = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=500,
    temperature=0.9,  # 多様性と創造性が必要
    messages=[{
        "role": "user",
        "content": "比喩を使って早朝の都市を描写してください"
    }]
)
```

### max_tokens：出力長の制御

`max_tokens` はモデルが最大何 token まで出力するかを設定します。このパラメータはコストとレスポンス時間に直接影響します。

**よくある誤解**：多くの人が max_tokens を 4096 以上に設定して「念のため」にしています。問題は：

1. モデルが本当にその長さのコンテンツを生成し、不要な出費になる
2. レスポンス時間が長くなる（より多い token = より長い生成時間）
3. 分類・抽出タスクでは出力が数文字で済む

**実践アドバイス**：予想される出力長に基づいて設定し、20〜30% のマージンを持たせれば十分。

| タスクタイプ | 予想出力 | 推奨 max_tokens |
|---------|---------|----------------|
| 分類/タグ付け | 1〜5文字 | 20-50 |
| エンティティ抽出 | 一段の JSON | 200-500 |
| 要約 | 一段落 | 300-600 |
| コード生成 | 一関数 | 500-1500 |
| 長文ライティング | 複数段落 | 2000-4096 |
| 翻訳 | 原文と同程度 | 原文 token 数 × 1.3 |

### top_p：もう一つのランダム性制御

`top_p`（nucleus sampling）は別の角度からランダム性を制御します：モデルが確率累積が p に達する token 集合からのみサンプリングするよう制限します。

- **top_p = 0.1**：最も可能性の高い少数の token からのみ選択、非常に保守的
- **top_p = 0.9**：ほぼすべての合理的な token から選択、比較的オープン
- **top_p = 1.0**：制限なし（デフォルト値）

**重要な注意**：一般的に temperature と top_p を同時に調整することは推奨されません。どちらか一方を調整してください：

- 精密制御が必要 → temperature を調整
- 「突飛な出力」を制限したい → top_p を調整

```python
# コード生成：top_p で制限し、構文エラーになる奇妙な token を避ける
code_response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1000,
    temperature=0.3,
    top_p=0.9,  # 確率が極めて低い突飛な選択肢を除外
    messages=[{
        "role": "user",
        "content": "Python で LRU Cache クラスを書いてください"
    }]
)
```

## シナリオ別早見表：そのまま使える推奨値

以下は各シナリオの推奨パラメータ組み合わせで、そのまま使えます：

| シナリオ | temperature | max_tokens | top_p | 説明 |
|------|------------|-----------|-------|------|
| テキスト分類 | 0 | 20-50 | 1.0 | 確定性が必要、出力は極短 |
| JSON 抽出 | 0 | 200-800 | 1.0 | フォーマットが正確でなければならない |
| コード生成 | 0.2-0.3 | 500-2000 | 0.95 | わずかな柔軟性、ただし脱線禁止 |
| 翻訳 | 0.1-0.3 | 原文×1.3 | 1.0 | 原文に忠実、若干の潤色余地 |
| 対話/チャット | 0.5-0.7 | 500-1000 | 1.0 | 自然で流暢、硬くない |
| クリエイティブライティング | 0.8-1.0 | 1000-4096 | 1.0 | 多様な表現を促進 |
| データ分析サマリー | 0.1-0.2 | 500-1500 | 1.0 | 正確性優先 |
| ブレインストーミング | 0.9-1.0 | 1000-2000 | 1.0 | 発散的であるほど良い |
| カスタマーサポート返信 | 0.3-0.5 | 300-800 | 1.0 | プロフェッショナルだが機械的でない |

## パラメータ調整実践：3ステップ法

### ステップ1：保守的な値から開始

どう調整すべか分からない場合は、まず低い temperature（0.2）+ 合理的な max_tokens で数回実行し、基本的な効果を確認。

### ステップ2：問題の方向に応じて調整

- 出力が硬すぎる、毎回同じ → temperature を上げる（毎回 +0.1）
- 出力が脱線、幻覚が発生 → temperature を下げる
- 出力が途中で切れる → max_tokens を増やす
- 出力が冗長 → max_tokens を減らし、同時にプロンプトに「簡潔に回答」を追加

### ステップ3：A/B テストで固定化

良さそうなパラメータ組み合わせを見つけたら、20〜50件の実際の入力で A/B テストを行い、異なるパラメータ組み合わせの出力品質を比較してから固定します。

```python
# シンプルなパラメータ比較テストフレームワーク
import json

test_cases = [
    "量子コンピューティングを一文で説明してください",
    "残業を断るメールを書いてください",
    "なぜ空は青いのか説明してください",
]

configs = [
    {"temperature": 0.3, "max_tokens": 500},
    {"temperature": 0.7, "max_tokens": 500},
    {"temperature": 1.0, "max_tokens": 500},
]

results = []
for case in test_cases:
    for config in configs:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": case}],
            **config,
        )
        results.append({
            "input": case,
            "config": config,
            "output": response.content[0].text,
        })

# 結果を保存して人間が評価
with open("param_test_results.json", "w") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
```

## よくある落とし穴

1. **max_tokens は出力長とイコールではない**：モデルは max_tokens に達する前に自然終了する場合があります。max_tokens は上限であって「この長さで書いて」という指示ではありません。
2. **temperature=0 は 100% 一致を保証しない**：浮動小数点精度等の要因により、ごくまれに temperature=0 でも微小な差異が出る場合があります。ハッシュレベルの一致性検証に頼らないでください。
3. **temperature でプロンプトエンジニアリングを代替しない**：出力品質に問題がある場合、まずプロンプトを改善してください。パラメータ調整は錦上添花であって雪中送炭ではありません。
4. **ストリーミング出力時も max_tokens は重要**：streaming を使っていても max_tokens は総量を制限します。ストリーミングだから気にしなくて良いわけではありません。

## おわりに

パラメータ調整は些細に見えますが、「同じプロンプト、同じモデルなのに結果が大きく違う」の鍵となる変数の一つです。10分でパラメータを正しく設定することは、2時間かけてプロンプトを修正するより効果的な場合があります。

異なるモデルのパラメータを調整する際に、OpenAI と Anthropic の API を別々に管理したくない方は、**Conduit AI** を試してみてください。統一 LLM API ゲートウェイとして、1つの BASE URL で Claude と GPT 全シリーズに接続、従量課金でサブスクリプション不要、価格は約 1/8（約 87% 節約）、HK$50 から利用開始で HK$5 プレゼント、Alipay・WeChat Pay・クレジットカード対応。パラメータ調整時にいつでもモデルを切り替えて効果を比較でき、API Key の変更は不要です。

---

### 関連記事

- [Claude 全モデルシリーズを一目で理解：Haiku から Opus までの選び方](/conduit-blog/ja/blog/claude-models-overview/)
- [thinking モデルはいつ使う価値がある？いつお金の無駄？](/conduit-blog/ja/blog/thinking-model-worth-it/)
- [ゼロから作る AI カスタマーサポートボット：最もコスパの良い方法](/conduit-blog/ja/blog/ai-support-bot-budget/)
