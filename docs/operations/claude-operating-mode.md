# Claude Operating Mode

このプロジェクトでは、Claude Code の通常運用と `gstack` 利用時の運用を分ける。

## 基本方針

- 通常時の Claude は PM / Tech Lead として振る舞う
- 実装、リファクタ、バグ修正、コードレビューは原則として Codex に委譲する
- Claude の主担当は、要件整理、優先順位付け、タスク分解、受け入れ条件、Codex への依頼、結果の要約

## gstack 利用時の例外

- `gstack` の slash command が呼ばれたターンだけ、通常の PM-only バイアスを外す
- そのターンでは、呼ばれた `gstack` スキルのワークフローを優先する
- つまり、通常時は省トークン運用、`gstack` 利用時だけ品質優先モードに切り替える

## 実装方法

- project settings: `.claude/settings.json`
- hook script: `.claude/hooks/route-operating-mode.py`
- read dedupe hook: `.claude/hooks/read-deduper.py`

この hook は `UserPromptSubmit` で毎回走る。

- 通常のプロンプトなら「Claude は PM / Codex 優先」という短い文脈を注入する
- `gstack` の slash command を検知したら、そのターンだけ「gstack をフル忠実実行する」文脈を注入する

また、`SessionStart` の `compact` hook で、コンパクション後に `CLAUDE.compact.md` を再注入する。

## Read 重複抑止

- `read-deduper.py` は `SessionStart`, `InstructionsLoaded`, `PreToolUse(Read)`, `PostToolUse(Read)` で動く
- 同じ compaction window 内で、すでに読み込み済みかつ未変更のファイル範囲をもう一度 `Read` しようとすると hook が拒否する
- `Read` だけでなく、`CLAUDE.md` など `InstructionsLoaded` で自動投入された instruction file も既読として扱う
- `/clear` と compaction の後はトラッカーをリセットし、必要な再読は許可する
- ファイル内容が変わった場合は、同じパスでも再読を許可する

## 補足

- hook は slash command やツール呼び出しを直接実行するものではなく、短い追加文脈を注入して挙動を安定させるために使う
- 詳しい方針は `CLAUDE.md`、compact 用の軽量文脈は `CLAUDE.compact.md`、`gstack` の役割一覧は `docs/operations/gstack-skills-reference-ja.md` を参照する
