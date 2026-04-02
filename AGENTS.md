# otaku-wassyoi — Agent Entry

このディレクトリでは `gstack` を repo 内に vendoring し、Codex と Claude で共有して使う。

## gstack

- Canonical source: `.agents/skills/gstack`
- Claude entrypoint: `.claude/skills/gstack`（`.agents/skills/gstack` への symlink）
- Codex では repo-local skills を `.agents/skills/` から読む
- ブラウザ操作が必要な場合は gstack の browse 系スキルを優先する
- 日本語のスキル早見表: `docs/operations/gstack-skills-reference-ja.md`

## Available Skills

- `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`
- `/design-consultation`, `/design-shotgun`, `/design-html`, `/design-review`
- `/review`, `/qa`, `/qa-only`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`
- `/browse`, `/connect-chrome`, `/setup-browser-cookies`, `/setup-deploy`
- `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`
- `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Recovery

- Claude 側のリンクや生成物を作り直す: `./.claude/skills/gstack/setup --host claude --no-prefix`
- Codex 側の生成物を作り直す: `cd .agents/skills/gstack && ./setup --host codex --no-prefix`
