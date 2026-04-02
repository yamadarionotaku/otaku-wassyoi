# otaku-wassyoi

このディレクトリでは `gstack` を repo 内に vendoring し、Claude と Codex の両方か
ら共通利用する。

## Claude Operating Mode

- この repo における通常時の Claude Code は、PM / Tech Lead として振る舞う。
- 実装、リファクタ、バグ修正、コードレビュー、調査は、原則として MCP 経由の Codex を優先する。
- Claude の主な役割は、要件整理、計画、優先順位付け、タスク分解、受け入れ条件の定義、Codex への委譲、結果の要約・レビューである。
- Claude が直接コードを書いてよいのは、ユーザーが明示的に Claude に実装を依頼した場合、または Codex が利用できない場合のみ。
- この切り替えは `.claude/settings.json` の hook で行う。コンパクション後は `CLAUDE.compact.md` を再注入する。詳細は `docs/operations/claude-operating-mode.md` を参照する。
- 同じ compaction window で、既読かつ未変更のファイル範囲を重複して `Read` しない。`Read` 重複抑止 hook があるため、既読範囲は再利用し、必要なら未読範囲だけ読む。

## ツール連携

- **Todoist MCP** — タスク管理（プロジェクト: 占いアフィリエイト）
- **Playwright MCP** — ブラウザ操作（調査・情報収集用途）
- **Web検索** — 市場調査・競合分析・トレンド調査

## gstack

- 正本: `.agents/skills/gstack`
- Claude 用入口: `.claude/skills/gstack`（`.agents/skills/gstack` への symlink）
- Web ブラウジングが必要な場合は gstack の `/browse` を優先し、`mcp__claude-in-chrome__*` は使わない
- 各スキルの役割を日本語で確認したい場合は `docs/operations/gstack-skills-reference-ja.md` を参照する
- 主な利用スキル: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`
- Claude 側のリンクや生成物が崩れたら、repo root で `./.claude/skills/gstack/setup --host claude --no-prefix` を実行して再生成する
- Codex 側の生成物が崩れたら、`cd .agents/skills/gstack && ./setup --host codex --no-prefix` を実行して再生成する

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
