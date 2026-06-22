---
title: "Claude Code カスタム slash コマンドと hooks 実践：よく使う操作をワンクリックに"
description: "Claude Code のカスタム slash コマンド（skills）と hooks の書き方を手順付きで解説。コードレビュー・フォーマット・セキュリティチェックなどの高頻度操作をワンクリックで実行し、繰り返し作業から解放されましょう。"
pubDate: 2026-06-22
tags: ["Claude Code", "効率化", "自動化"]
keywords: ["Claude Code slash コマンド", "Claude Code hooks", "カスタムコマンド", "Claude Code skills"]
draft: false
---

毎日 Claude Code でコードを書いていて、同じことを繰り返していませんか？コミット前に毎回 lint を走らせたり、ファイル変更後に手動でフォーマットしたり、レビューのたびに同じプロンプトを貼り付けたり……

朗報です。Claude Code はネイティブで2つの自動化メカニズムをサポートしています：**カスタム slash コマンド（Skills）** と **Hooks** です。前者はよく使うプロンプトを `/xxx` でワンクリック呼び出しにパッケージ化し、後者はツール実行の前後に自動で検査スクリプトをトリガーします。この2つを組み合わせれば、Claude Code を高度にカスタマイズされた個人ワークフローエンジンに変えることができます。

## 2つのメカニズムの役割分担を理解する

まず、それぞれが解決する問題を整理しましょう。使い分けを間違えないために：

| 項目 | Slash コマンド（Skills） | Hooks |
|------|----------------------|-------|
| トリガー方法 | 手動で `/コマンド名` を入力、または Claude が自動マッチ | 特定のライフサイクルイベントで自動トリガー |
| 本質 | frontmatter 付きの Markdown プロンプト | shell コマンド / HTTP リクエスト / MCP 呼び出し |
| 典型的な用途 | コードレビュー、テンプレート生成、変更サマリー | 自動フォーマット、危険操作のブロック、セキュリティスキャン |
| 配置場所 | `.claude/skills/<名前>/SKILL.md` | `.claude/settings.json` または `~/.claude/settings.json` |
| 実行者 | Claude（指示を読み取りツールでタスクを完了） | システム（Claude のツール呼び出し前後に自動実行） |

一言でまとめると：**Skills は「Claude に何をさせたいか」、Hooks は「Claude が何かをする時にシステムが自動で何をするか」** です。

## 実践 1：カスタム slash コマンドを作る

最もよくあるシナリオ——コミット前に毎回 Claude に変更のサマリーと潜在リスクを見てもらいたい場合。毎回手入力する代わりに `/review-changes` として固定化しましょう。

### ステップ1：ディレクトリとファイルを作成

```bash
# プロジェクトレベル（現在のプロジェクトのみ有効）
mkdir -p .claude/skills/review-changes

# または個人レベル（すべてのプロジェクトで使用可能）
mkdir -p ~/.claude/skills/review-changes
```

### ステップ2：SKILL.md を書く

```yaml
---
description: 未コミットのコード変更をサマリーし、潜在リスクを指摘する。ユーザーが「何を変えた」「レビューして」と聞いたときに自動トリガー。
disable-model-invocation: false
---

## 現在の変更

!`git diff HEAD`

## 指示

上記の diff に基づいて以下のタスクを完了してください：
1. 今回の変更を 3〜5 つのポイントでサマリーする
2. 潜在リスクを指摘する（エラーハンドリングの不足、ハードコードされた値、テストの漏れなど）
3. diff が空なら、未コミットの変更がないことを知らせる
```

ここで2つの重要ポイントがあります：

- `` !`git diff HEAD` `` は**動的コンテキスト注入**——Claude Code がまずこのコマンドを実行し、出力をプロンプトにインライン化するため、Claude が見るのは最新の diff そのものです
- `description` は人間向けだけでなく、Claude がこの skill を自動ロードすべきか判断するためにも使われます

### ステップ3：テスト

```text
> /review-changes          # 手動呼び出し
> 何を変えたか見せて          # Claude が description を自動マッチしてトリガー
```

### 応用：引数付きコマンド

特定のファイルに対する詳細レビューをしたい場合は `$ARGUMENTS` プレースホルダーを使います：

```yaml
---
description: 指定ファイルに対する詳細コードレビューを実行する
disable-model-invocation: true
---

以下のファイルに対して詳細なコードレビューを行い、セキュリティ・パフォーマンス・保守性に注目してください：

!`cat $ARGUMENTS`

ファイルパス：$ARGUMENTS
```

呼び出し時：`/deep-review src/auth/login.ts`

## 実践 2：Hooks で自動化を実現する

Hooks は Claude Code の「ライフサイクルフック」——特定のイベント発生時に定義したスクリプトを自動実行します。現在サポートされているイベントは豊富です：

| 主要イベント | トリガータイミング | ブロック可否 |
|----------|----------|----------|
| `PreToolUse` | ツール呼び出し実行前 | ✅ 実行を阻止可能 |
| `PostToolUse` | ツール呼び出し成功後 | ❌ ただしコンテキスト追加可能 |
| `Stop` | Claude が応答を完了した時 | ✅ 停止を阻止可能 |
| `UserPromptSubmit` | ユーザーがプロンプトを送信した後 | ✅ インターセプト可能 |
| `SessionStart` | セッションの開始または再開時 | ❌ |
| `SubagentStop` | サブエージェント完了時 | ✅ 停止を阻止可能 |

### シナリオ A：自動フォーマット——書いたら即整形

Claude がファイルの書き込みや編集を完了するたびに、自動で Prettier を実行：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write",
            "args": ["${tool_input.file_path}"]
          }
        ]
      }
    ]
  }
}
```

この設定を `.claude/settings.json` に追加します。`matcher` は `Edit` または `Write` ツールの実行後にのみトリガーすることを指定し、`${tool_input.file_path}` は編集されたファイルパスに自動置換されます。

### シナリオ B：危険な rm コマンドをブロック

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "echo '⛔ rm コマンドを検出、実行をブロックしました' >&2 && exit 2"
          }
        ]
      }
    ]
  }
}
```

ポイント：**exit 2** は Claude Code hooks の特殊な終了コードで、「操作をブロック」を意味します。exit 0 は成功（パス）、その他の終了コードはブロックしない警告です。

### シナリオ C：完了前にテストを強制実行

`Stop` hook を使い、Claude がタスクを完了する前にテストが通っているか確認：

```bash
#!/bin/bash
# .claude/hooks/check-tests.sh
npm test --silent 2>&1
if [ $? -ne 0 ]; then
  echo '{"decision": "block", "reason": "テスト未通過、修正してから完了してください"}'
  exit 2
fi
```

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/check-tests.sh"
          }
        ]
      }
    ]
  }
}
```

これにより Claude が「完了」しようとするたびにテストが実行され、通らなければ修正を続けます。

## Skills + Hooks のコンビネーション

最も強力な使い方は両者を組み合わせることです。例として——セキュアなデプロイフロー：

1. **Skill**：`/deploy` コマンドを作成し、デプロイ手順のプロンプトを含める
2. **Hook**：Skill の frontmatter 内に `PreToolUse` hook を定義し、セキュリティチェックスクリプトを自動実行
3. Skill がアクティブな時だけ hook が有効になり、グローバル設定を汚しない

```yaml
# .claude/skills/deploy/SKILL.md
---
description: アプリケーションを本番環境にデプロイする
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---

以下の手順でデプロイしてください：
1. 完全なテストスイートを実行し、全パスを確認
2. 本番ビルドを作成
3. データベースマイグレーションを実行（あれば）
4. 本番環境にデプロイ
5. ヘルスチェックエンドポイントが 200 を返すことを確認
```

ここで hooks が Skill の frontmatter に直接書かれており、**その skill がアクティブな時のみ有効**——この「ローカル hook」の設計は非常にエレガントで、フローごとに専用のセキュリティポリシーを定義できます。

## Skills と Hooks の管理

増え続ける自動化設定を維持するための実用的な管理テクニック：

- **ロード済み hooks を確認**：Claude Code で `/hooks` を入力すると、現在有効な全 hook を確認できます（読み取り専用）
- **緊急時に全 hooks を無効化**：settings.json で `"disableAllHooks": true` を設定
- **Skill の優先順位**：Enterprise > 個人 > プロジェクト、同名の場合は高優先度が上書き
- **ホットリロード**：`SKILL.md` を変更後、Claude Code の再起動不要——ファイル変更を自動検出して再ロードします
- **旧フォーマットとの互換**：`.claude/commands/xxx.md` は引き続き有効ですが、`.claude/skills/xxx/SKILL.md` への移行を推奨——後者はスクリプトやテンプレートなどの補助ファイルを同梱できます
- **Hook 設定の階層**：`~/.claude/settings.json`（グローバル）、`.claude/settings.json`（プロジェクトレベル・コミット可）、`.claude/settings.local.json`（プロジェクトレベル・コミット不可）

---

カスタム slash コマンドと hooks は Claude Code で最も時間をかけて整備する価値のある機能です——一度設定すれば長期的に恩恵を受けられます。Conduit AI で Claude Code に接続している場合も、これらの自動化フローは完全に利用可能です。しかも従量課金モデルでは、hooks で不要なやり取りを減らすことで token の節約にもなります。Conduit AI は統一 LLM API ゲートウェイとして、1つの BASE URL で Claude と GPT に接続でき、約 1/8 の価格（約 87% 節約）、HK$50 から利用開始・登録で HK$5 プレゼント、Alipay・WeChat Pay・クレジットカード対応です。

---

**関連記事**：[Claude Code クイックスタートガイド](/conduit-blog/ja/blog/claude-code-quickstart/) · [CLAUDE.md 設定ガイド](/conduit-blog/ja/blog/claude-md-guide/) · [Claude Code token 節約テクニック](/conduit-blog/ja/blog/claude-code-save-tokens/)
