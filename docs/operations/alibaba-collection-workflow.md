# Alibaba 収集ワークフロー

このドキュメントは、Claude Code でユーザーから「収集して」と指示されたときに、PM としての Claude が参照する運用手順書である。実装仕様ではなく、オーケストレーションの順番、委譲先、入出力ファイルを固定するための運用ドキュメントとして使う。

## 前提

- PM は Claude。全体の進行、キーワード確定、マージ、最終判断、デプロイ確認を担当する。
- 実データの収集と最終二重チェックは Codex に委譲する。
- Layer 2 の意味判定は Claude 子エージェントを並列で使う。
- 収集対象は Alibaba 上の原神フィギュア系商品。
- このフローで生成される中間成果物は `data/` 配下に置く。

## 1. ワークフロー概要

```text
ユーザー: 「収集して」
  ↓
Claude(PM): 前回収集結果を確認
  ↓
Phase 0: 固定5キーワードを確定
  + Codex 調査エージェントに追加キーワード 3〜5 個を提案させる
  ↓
Phase 1: キーワードごとに Codex 収集エージェントを並列起動
  → 各エージェントが data/alibaba-{keyword-slug}.json を出力
  ↓
Phase 2: 3層フィルタリング
  1. Layer 1: ルールベース除外
  2. Layer 2: 100件ごとに Claude 子エージェントで意味判定
  3. Layer 3: スクリプトで重複除去
  ↓
Phase 3: Codex による二重チェック
  → 除外URLを反映
  → 最終データを items テーブルへ投入
  ↓
Phase 4: git commit + push
  → Vercel 自動デプロイ
  → 本番 URL で件数確認
  → ユーザーへ目視確認を依頼
```

## 2. Phase 0: キーワード調査

### 固定キーワード

以下の 5 個は毎回必ず実行する。

1. `genshin impact action figure`
2. `genshin impact pvc figure`
3. `genshin impact figurine`
4. `genshin impact gk figure`
5. `genshin impact gk resin statue`

### 追加キーワードの決定方法

追加キーワードは毎回 3〜5 個まで。目的は、前回収集でカバレッジが弱かったキャラ名や種別を補うことにある。

手順は以下。

1. Claude が前回の収集結果を用意する。
2. 前回の最終結果として使った JSON、または同等の集計メモを Codex 調査エージェントに渡す。
3. Codex に「カバレッジが弱いキャラ」と「カバレッジが弱い種別」を特定させる。
4. それを埋める追加キーワードを 3〜5 個提案させる。
5. Claude が固定 5 キーワードとの重複を除き、最終セットを確定する。

前回結果が存在しない初回は、固定 5 キーワードのみで開始してよい。

### Codex 調査エージェントへの依頼内容

最低限、以下を渡す。

- 前回の収集結果ファイル
- 前回の収集で弱かったと考えられるメモがあればその要約
- 今回の対象が「原神のフィギュア系商品」であること

依頼テンプレート:

```text
あなたは Alibaba 収集のキーワード調査担当です。

入力:
- 前回収集結果: {path-or-summary}
- 固定キーワード:
  - genshin impact action figure
  - genshin impact pvc figure
  - genshin impact figurine
  - genshin impact gk figure
  - genshin impact gk resin statue

やってほしいこと:
1. 前回結果から、カバレッジが弱い原神キャラを特定する
2. 前回結果から、カバレッジが弱い商品種別を特定する
3. その穴を埋める追加キーワードを 3〜5 個提案する

制約:
- 固定キーワードと実質的に同じものは避ける
- 追加キーワードは、キャラ名または種別の補完として説明可能であること
- 出力は日本語

出力形式:
- カバレッジが弱いキャラ
- カバレッジが弱い種別
- 追加キーワード候補 3〜5 個
- 各キーワードの狙い
```

## 3. Phase 1: 並列データ収集

### 基本方針

- Claude は確定したキーワード数だけ Codex 収集エージェントを並列起動する。
- 1 エージェント 1 キーワード担当に固定する。
- 各エージェントは自分の出力 JSON 以外を担当しない。
- 出力先は `data/alibaba-{keyword-slug}.json` に統一する。

`keyword-slug` は以下の規則で作る。

- 英小文字
- 空白は `-`
- 連続ハイフンは 1 個に正規化
- 記号は必要最小限のみ残す

例:

- `genshin impact action figure` → `alibaba-genshin-impact-action-figure.json`
- 実在の既存ファイル名に合わせる場合は、既存スクリプトの命名を優先してよい

固定 5 キーワードについては、既存スクリプトと既存出力ファイルをそのまま使う。

| キーワード | 既存スクリプト | 出力ファイル |
|---|---|---|
| `genshin impact action figure` | `scripts/fetch-alibaba-genshin-action-figure.mjs` | `data/alibaba-genshin-action-figure.json` |
| `genshin impact pvc figure` | `scripts/fetch-alibaba-genshin-pvc-figure.mjs` | `data/alibaba-genshin-pvc-figure.json` |
| `genshin impact figurine` | `scripts/fetch-alibaba-genshin-figurine.mjs` | `data/alibaba-genshin-figurine.json` |
| `genshin impact gk figure` | `scripts/fetch-alibaba-genshin-gk-figure.mjs` | `data/alibaba-genshin-gk-figure.json` |
| `genshin impact gk resin statue` | `scripts/fetch-alibaba-genshin-gk-resin-statue.mjs` | `data/alibaba-genshin-gk-resin-statue.json` |

追加キーワードは、既存の `scripts/fetch-alibaba-*.mjs` パターンを踏襲し、同じ出力形式の JSON を `data/` に保存する。

### Codex 並列エージェントの起動方法

Claude は Agent ツールで Codex ワーカーをキーワード数分だけ並列起動する。各ワーカーには以下を固定で渡す。

- 担当キーワード
- 出力ファイルパス
- 既存の fetch スクリプトを再利用または踏襲すること
- 他キーワードのファイルには触らないこと
- 最終的に JSON 配列を書き出すこと

実行順は以下。

1. Phase 0 で確定したキーワード一覧を作る
2. キーワードごとに 1 つずつ Codex ワーカーを起動する
3. 全ワーカーを並列で走らせる
4. 完了後に出力ファイルの存在と JSON 形式を確認する
5. 失敗したキーワードだけ個別に再実行する

完了条件は以下。

- 対応する `data/alibaba-{keyword-slug}.json` が存在する
- JSON のトップレベルが配列である
- 各レコードに最低限 `title`, `url` が入っている

### 各エージェントへのプロンプトテンプレート

```text
あなたは Alibaba 収集ワーカーです。

担当キーワード:
{keyword}

出力先:
{output_path}

やってほしいこと:
1. 既存の `scripts/fetch-alibaba-*.mjs` パターンを再利用または踏襲して、このキーワードの収集を実行する
2. 結果を JSON 配列として `{output_path}` に保存する
3. 既存ファイルがあれば今回の結果で更新する

制約:
- 他キーワードの出力ファイルは編集しない
- JSON レコードには最低限 `title`, `url` を含める
- 可能なら `price`, `image`, `seller` も維持する
- 既存スクリプトがある場合はそれを優先して使う

最終報告:
- 出力ファイル
- 取得件数
- 実行または更新したスクリプト
- エラーや不足があればその内容
```

## 4. Phase 2: 3層フィルタリング

### Layer 1: ルールベース自動除外

まず Claude が以下を実行する。

```bash
node scripts/filter-alibaba-layer1.mjs
```

生成物:

- `data/filtered-layer1.json`
- `data/filtered-layer1-excluded.json`

Layer 1 は URL 重複、非原神キーワード、非フィギュア語彙、他作品語彙などのルールベース除外を担当する。

### Layer 2: Claude 子エージェントによる意味判定

`data/filtered-layer1.json` を 100 件ごとにチャンク分割し、Claude 子エージェントを並列起動する。各エージェントは 1 チャンクだけ担当する。

実行順は以下。

1. `data/filtered-layer1.json` を読み込む
2. 100 件ごとのチャンクに分ける
3. チャンク数分の Claude 子エージェントを並列起動する
4. 各エージェントの `keep` を回収する
5. Claude が全 `keep` をマージして `data/filtered-layer2.json` を生成する

各エージェントに渡すもの:

- 判定対象 100 件の JSON
- 原神キャラリスト
- 判定基準

判定基準は最低限以下。

- 原神キャラの商品として妥当なものだけを残す
- フィギュア、スタチュー、GK、レジン像など立体系商品のみ残す
- 他作品のキャラ、汎用アニメフィギュア、キャラ不明品は除外する
- 原神でもアクリルスタンド、ぬいぐるみ、コスプレ、小物は除外する
- 判断に迷う場合は残さず除外寄りに判定し、理由を残す

Layer 2 の出力方針:

- 各エージェントは「残すレコードの原文 JSON 配列」を返す
- Claude が全チャンクの結果をマージして `data/filtered-layer2.json` を生成する
- `data/filtered-layer2.json` では元レコードの shape を変えない

子エージェント用テンプレート:

```text
あなたは Alibaba 収集 Layer 2 の判定担当です。

入力:
- 対象 100 件: {chunk_json}
- 原神キャラリスト: {genshin_character_list}

判定基準:
- 原神キャラの商品として妥当なものだけ残す
- フィギュア、スタチュー、GK、レジン像など立体系商品のみ残す
- 他作品のキャラ、汎用アニメフィギュア、キャラ不明品は除外する
- 原神でもアクリルスタンド、ぬいぐるみ、コスプレ、小物は除外する
- 迷うものは除外寄り

出力:
- keep: 元レコードの JSON 配列
- exclude_summary: 除外した URL と短い理由の一覧
```

### Layer 3: スクリプトによる重複除去

Layer 2 のマージ結果に対して、Claude が以下を実行する。

```bash
node scripts/filter-alibaba-layer3-dedup.mjs data/filtered-layer2.json
```

生成物:

- `data/filtered-layer3.json`
- `data/filtered-layer3-duplicates.json`

Layer 3 はタイトル類似度と価格帯を使ったコンテンツ重複除去を担当する。

## 5. Phase 3: 二重チェック + DB投入

### Codex による最終二重チェック

Claude は `data/filtered-layer3.json` を Codex に渡し、最終確認を依頼する。

確認内容:

- 本当に原神キャラ商品か
- コンテンツ重複がまだ残っていないか
- 除外すべきものがあれば URL リストで返す

依頼テンプレート:

```text
あなたは Alibaba 収集結果の最終監査担当です。

入力:
- `data/filtered-layer3.json`

やってほしいこと:
1. 各レコードが原神キャラ商品として妥当か最終確認する
2. コンテンツ重複が残っていないか最終確認する
3. 除外すべきものがあれば URL の一覧で返す

出力形式:
- keep してよいと判断した総評
- 除外対象 URL 一覧
- 各 URL の除外理由
```

Claude は返却された除外 URL を反映し、DB 投入に使う最終データを確定する。運用上は `data/filtered-final.json` のような単一ファイルに固めてから投入するのが望ましい。

### DB投入

- 投入先テーブルは `items`
- `items` は統合テーブルであり、スキーマは別途確定
- したがって DB 投入スクリプトは、最終的に `items` へ upsert する形に更新して使う

現状の `scripts/import-alibaba-genshin-figures-to-supabase.mjs` は `alibaba_items` を前提にしているため、そのままでは最終形ではない。運用としては、Codex の二重チェック後の最終データを入力にし、`items` に upsert する版へ更新したものを使う。

## 6. Phase 4: デプロイ + 目視確認

DB 投入後、Claude は以下の順で進める。

1. 変更を `git commit` する
2. `git push` して Vercel の自動デプロイを待つ
3. 本番 URL で件数を確認する
4. ユーザーに目視確認を依頼する

本番確認で最低限見るもの:

- 想定した件数が増えているか
- 新規投入分が一覧に表示されるか
- 明らかな重複や異物が残っていないか

ユーザーへの依頼文面の例:

```text
本番反映は完了しました。件数は確認済みです。
一覧を軽く目視して、明らかな重複や別作品の混入がないか確認してください。
```

## 7. 各スクリプトの場所

| スクリプト | パス | 用途 |
|---|---|---|
| Layer 1 フィルタ | `scripts/filter-alibaba-layer1.mjs` | ルールベース自動除外 |
| Layer 3 重複検出 | `scripts/filter-alibaba-layer3-dedup.mjs` | コンテンツ重複除去 |
| 収集スクリプト | `scripts/fetch-alibaba-*.mjs` | 各キーワードの収集 |
| DB投入 | `scripts/import-alibaba-genshin-figures-to-supabase.mjs` | DB upsert（要更新） |

## 運用メモ

- Phase は必ず 0 → 1 → 2 → 3 → 4 の順に進める。
- 並列化するのは Phase 1 の収集ワーカーと Phase 2 の Layer 2 判定ワーカーのみ。
- Layer 3 の重複除去と Phase 3 の最終監査は、必ず Layer 2 のマージ完了後に実行する。
- 収集件数よりも混入率の低さを優先する。迷う候補は残さない。

## 8. cron 自動実行

### 前提条件
- PC がつけっぱなしであること（WSL が動作していること）
- Claude Code CLI がインストールされ、認証済みであること
- Node.js と npm が利用可能であること

### セットアップ

1. crontab に登録:
   ```bash
   crontab -e
   # 毎週月曜 AM 3:00 に実行
   0 3 * * 1 cd /home/yamadarion/projects/otaku-wassyoi && bash scripts/cron-alibaba-collect.sh >> logs/cron-alibaba.log 2>&1
   ```

2. 動作確認:
   ```bash
   bash scripts/cron-alibaba-collect.sh
   ```

### ログ
- 実行ログ: `logs/cron-alibaba.log`（追記モード）
- 実行サマリ: `logs/cron-alibaba-{date}.log`
- 各実行のタイムスタンプ付きで開始・終了・結果を記録

### 二重起動防止
- `/tmp/alibaba-collect.lock` で排他制御
- 前回の実行が完了していない場合はスキップ

### トラブルシューティング
- Claude Code CLI の認証が切れている場合: `claude auth login` を手動で実行
- cron 環境で `claude` コマンドが見つからない場合: スクリプト内で `~/.local/bin` を含む `PATH` を明示しているか確認
- Codex MCP が応答しない場合: Claude Code を再起動
- ログが肥大化した場合: `logs/cron-alibaba.log` を手動で truncate
