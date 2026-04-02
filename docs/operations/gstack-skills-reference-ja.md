# gstack スキル早見表

このディレクトリで使える `gstack` スキルの役割を、日本語で短く確認するための一覧。

- 正本: `.agents/skills/gstack`
- Claude 用入口: `.claude/skills/gstack`
- ここでは分かりやすさのため、共通の slash 名で表記する

## おすすめの流れ

`/office-hours` → `/plan-ceo-review` → `/plan-eng-review` → `/plan-design-review` → `/review` → `/qa` → `/ship` → `/land-and-deploy` → `/retro`

## 企画・計画

| スキル | 担当 | 役割 |
|---|---|---|
| `/office-hours` | 事業壁打ち役 | 課題の捉え方を整理し直し、何を作るべきかを再定義する出発点。 |
| `/plan-ceo-review` | CEO / Founder | 依頼の奥にある「本当に価値が高い形」を見つけ、プロダクトの方向性を磨く。 |
| `/plan-eng-review` | Eng Manager | アーキテクチャ、データフロー、失敗パターン、テスト観点を固める。 |
| `/plan-design-review` | Senior Designer | 企画段階の UI/UX 方針をレビューし、体験品質の弱点を洗い出す。 |
| `/autoplan` | Review Pipeline | CEO レビュー、デザインレビュー、技術レビューをまとめて順に回す。 |

## デザイン

| スキル | 担当 | 役割 |
|---|---|---|
| `/design-consultation` | Design Partner | プロダクト全体のデザイン方針やトーンを一緒に組み立てる。 |
| `/design-shotgun` | Design Explorer | 複数のデザイン案を一気に出して、比較しながら方向性を決める。 |
| `/design-html` | Design Engineer | 承認済みデザインを、実装に近い HTML に落とし込む。 |
| `/design-review` | Designer Who Codes | 画面を見ながら見た目と使い勝手を監査し、必要なら修正まで進める。 |

## 実装・レビュー

| スキル | 担当 | 役割 |
|---|---|---|
| `/review` | Staff Engineer | 差分を読んで、本番で事故になりそうなバグや抜け漏れを見つける。 |
| `/codex` | Second Opinion | 別モデル視点の追加レビューや反証を取り、見落としを減らす。 |
| `/investigate` | Debugger | まず原因を特定することに集中し、闇雲な修正を防ぐ。 |
| `/learn` | Memory | この repo で学んだ癖や注意点を蓄積・参照する。 |

## QA・ブラウザ・性能

| スキル | 担当 | 役割 |
|---|---|---|
| `/browse` | QA Engineer | 実ブラウザを使ってページ確認、遷移、スクリーンショット取得を行う。 |
| `/connect-chrome` | Chrome Controller | 手元の Chrome を gstack から操作できるようにする。 |
| `/setup-browser-cookies` | Session Manager | 既存ブラウザの cookie を取り込み、ログイン済み状態で検証しやすくする。 |
| `/qa` | QA Lead | 実際に触って不具合を探し、修正と再確認まで進める。 |
| `/qa-only` | QA Reporter | QA はするが修正はせず、バグ報告に専念する。 |
| `/benchmark` | Performance Engineer | 表示速度やリソース量を測り、変更前後の性能差を確認する。 |
| `/canary` | SRE | デプロイ後の挙動を監視し、エラーや劣化の兆候を拾う。 |

## リリース・運用

| スキル | 担当 | 役割 |
|---|---|---|
| `/ship` | Release Engineer | テスト、レビュー、PR 作成までをまとめて進める。 |
| `/setup-deploy` | Deploy Configurator | デプロイ手順や本番 URL など、リリース前提の設定を整える。 |
| `/land-and-deploy` | Release Engineer | PR を取り込み、デプロイ完了と本番確認まで進める。 |
| `/document-release` | Technical Writer | 実装内容に合わせて README や運用ドキュメントの差分を埋める。 |
| `/retro` | Eng Manager | 直近の開発を振り返り、改善点や次に強化すべき点を整理する。 |

## セキュリティ・安全装置

| スキル | 担当 | 役割 |
|---|---|---|
| `/cso` | Chief Security Officer | セキュリティ観点で危ない実装や設計を洗い出す。 |
| `/careful` | Safety Guardrails | 破壊的コマンドの前に警告を出し、事故を防ぐ。 |
| `/freeze` | Edit Lock | 編集可能範囲を 1 ディレクトリに絞り、関係ない場所の変更を防ぐ。 |
| `/guard` | Full Safety | `/careful` と `/freeze` をまとめて有効化する。 |
| `/unfreeze` | Unlock | `/freeze` の制限を解除して、通常編集に戻す。 |
| `/gstack-upgrade` | Self-Updater | vendoring した gstack を更新し、差分確認と再生成を助ける。 |

## 迷ったときの使い分け

- 何を作るべきか曖昧: `/office-hours`
- 企画の価値を上げたい: `/plan-ceo-review`
- 実装の設計を固めたい: `/plan-eng-review`
- 見た目や体験を詰めたい: `/plan-design-review` または `/design-review`
- 差分の危険箇所を見たい: `/review`
- 不具合の原因を掘りたい: `/investigate`
- 実ブラウザで確認したい: `/browse` または `/qa`
- 出荷前の一連を進めたい: `/ship`
- 本番反映まで進めたい: `/land-and-deploy`
