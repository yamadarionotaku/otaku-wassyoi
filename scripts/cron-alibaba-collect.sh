#!/usr/bin/env bash
# Alibaba 収集ワークフロー cron 自動実行スクリプト
#
# 使い方:
#   bash scripts/cron-alibaba-collect.sh
#
# cron 設定例（毎週月曜 AM 3:00）:
#   0 3 * * 1 cd /home/yamadarion/projects/otaku-wassyoi && bash scripts/cron-alibaba-collect.sh >> logs/cron-alibaba.log 2>&1

set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="${HOME:-/home/yamadarion}/.local/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

mkdir -p logs

LOCK_FILE="/tmp/alibaba-collect.lock"
RUN_DATE="$(date '+%Y-%m-%d')"
START_TS="$(date '+%Y-%m-%d %H:%M:%S %Z')"
SUMMARY_LOG="logs/cron-alibaba-${RUN_DATE}.log"

CLAUDE_EXIT_CODE="not-run"
SCRIPT_EXIT_CODE="unknown"
RESULT_STATUS="unknown"
LOCK_MODE="none"
SKIPPED="false"

PROMPT="docs/operations/alibaba-collection-workflow.md のワークフローに従って、Alibaba 収集を Phase 0 から Phase 4 まで全工程実行してください。追加キーワードは Phase 0 の調査結果から決定してください。完了後は git commit + push でデプロイまで行ってください。"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')" "$*"
}

write_summary() {
  local end_ts="$1"

  {
    printf '=== Alibaba cron run ===\n'
    printf 'start: %s\n' "$START_TS"
    printf 'end: %s\n' "$end_ts"
    printf 'status: %s\n' "$RESULT_STATUS"
    printf 'script_exit_code: %s\n' "$SCRIPT_EXIT_CODE"
    printf 'claude_exit_code: %s\n' "$CLAUDE_EXIT_CODE"
    printf 'lock_mode: %s\n' "$LOCK_MODE"
    if [[ "$SKIPPED" == "true" ]]; then
      printf 'note: skipped because another run is still active\n'
    fi
    printf 'full_log: logs/cron-alibaba.log\n'
    printf '\n'
  } >> "$SUMMARY_LOG"
}

acquire_lock() {
  if command -v flock >/dev/null 2>&1; then
    exec 9>"$LOCK_FILE"
    if ! flock -n 9; then
      return 1
    fi
    LOCK_MODE="flock"
    return 0
  fi

  if ( set -o noclobber; echo "$$" > "$LOCK_FILE" ) 2>/dev/null; then
    LOCK_MODE="file"
    return 0
  fi

  return 1
}

cleanup() {
  local exit_code=$?
  local end_ts
  end_ts="$(date '+%Y-%m-%d %H:%M:%S %Z')"

  if [[ "$LOCK_MODE" == "file" && -f "$LOCK_FILE" ]]; then
    rm -f "$LOCK_FILE"
  fi

  if [[ "$SCRIPT_EXIT_CODE" == "unknown" ]]; then
    SCRIPT_EXIT_CODE="$exit_code"
  fi

  if [[ "$RESULT_STATUS" == "unknown" ]]; then
    if [[ "$exit_code" -eq 0 ]]; then
      RESULT_STATUS="success"
    else
      RESULT_STATUS="error"
    fi
  fi

  write_summary "$end_ts"
  log "Alibaba cron run finished with status=${RESULT_STATUS} script_exit_code=${SCRIPT_EXIT_CODE} claude_exit_code=${CLAUDE_EXIT_CODE}"
}

trap cleanup EXIT

log "Starting Alibaba collection cron workflow"
log "Repository root: $(pwd)"
log "Summary log: $SUMMARY_LOG"

if ! acquire_lock; then
  LOCK_MODE="busy"
  RESULT_STATUS="skipped"
  SCRIPT_EXIT_CODE="0"
  SKIPPED="true"
  log "Another Alibaba collection run is active. Skipping this execution."
  exit 0
fi

log "Invoking Claude Code CLI"
set +e
claude -p "$PROMPT" \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep,Agent,mcp__codex__codex" \
  --max-turns 50
CLAUDE_EXIT_CODE="$?"
set -e

SCRIPT_EXIT_CODE="$CLAUDE_EXIT_CODE"

if [[ "$CLAUDE_EXIT_CODE" -eq 0 ]]; then
  RESULT_STATUS="success"
  log "Claude Code CLI completed successfully"
else
  RESULT_STATUS="failed"
  log "Claude Code CLI exited with code $CLAUDE_EXIT_CODE"
fi

exit "$CLAUDE_EXIT_CODE"
