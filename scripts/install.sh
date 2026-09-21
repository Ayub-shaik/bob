#!/usr/bin/env bash
# ==============================================================================
# Bob: Lightweight core install — skill, rules, telemetry CLIs only.
# Optional drivers: bob-ensure <tool> when a task needs them.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=================================================================="
echo "  INSTALLING BOB (core only — drivers on demand via bob-ensure)"
echo "=================================================================="
echo ""

log_info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
log_succ()  { echo -e "\033[1;32m[SUCCESS]\033[0m $*"; }
log_warn()  { echo -e "\033[1;33m[WARN]\033[0m $*"; }

log_info "1/2: Checking prerequisites (git)..."

if ! command -v git &>/dev/null; then
  echo "Git is recommended but not required for file copy."
fi

log_succ "Ready."
echo ""

log_info "2/2: Installing Bob core (skill, rules, CLIs)..."

CURSOR_SKILLS_DIR="${HOME}/.cursor/skills/bob"
CURSOR_RULES_DIR="${HOME}/.cursor/rules"
CLAUDE_SKILLS_DIR="${HOME}/.claude/skills/bob"
LOCAL_BIN_DIR="${HOME}/.local/bin"

mkdir -p "$CURSOR_SKILLS_DIR" "$CURSOR_RULES_DIR" "$CLAUDE_SKILLS_DIR" "$LOCAL_BIN_DIR" "${HOME}/.bob/telemetry"
touch "${HOME}/.bob/telemetry/events.jsonl"
chmod 755 "${HOME}/.bob" "${HOME}/.bob/telemetry" 2>/dev/null || true
chmod 644 "${HOME}/.bob/telemetry/events.jsonl" 2>/dev/null || true

cp "$REPO_ROOT/skills/bob/SKILL.md" "$CURSOR_SKILLS_DIR/SKILL.md"
cp "$REPO_ROOT/skills/bob/SKILL.md" "$CLAUDE_SKILLS_DIR/SKILL.md"
cp "$REPO_ROOT/rules/bob.mdc" "$CURSOR_RULES_DIR/bob.mdc"
cp "$REPO_ROOT/rules/token-diet.mdc" "$CURSOR_RULES_DIR/token-diet.mdc"
cp "$REPO_ROOT/rules/empirical-verification-invariants.mdc" "$CURSOR_RULES_DIR/empirical-verification-invariants.mdc"
cp "$REPO_ROOT/bin/bob-telemetry" "$LOCAL_BIN_DIR/bob-telemetry"
cp "$REPO_ROOT/bin/bob-dashboard" "$LOCAL_BIN_DIR/bob-dashboard"
cp "$REPO_ROOT/bin/bob-ensure" "$LOCAL_BIN_DIR/bob-ensure"
chmod +x "$LOCAL_BIN_DIR/bob-telemetry" "$LOCAL_BIN_DIR/bob-dashboard" "$LOCAL_BIN_DIR/bob-ensure"
ln -sf "$LOCAL_BIN_DIR/bob-telemetry" "$LOCAL_BIN_DIR/bob"

log_succ "Skill:     $CURSOR_SKILLS_DIR/SKILL.md"
log_succ "Rules:     bob.mdc, token-diet.mdc, empirical-verification-invariants.mdc"
log_succ "CLIs:      bob, bob-telemetry, bob-dashboard, bob-ensure"
echo ""
echo "Optional MCP servers (wire only what you use): $REPO_ROOT/mcp-config.example.json"
echo "On-demand drivers: bob-ensure rtk | context-mode | oxlint | graft | mnemosyne"
echo ""
echo "=================================================================="
log_succ "Bob core installed. Invoke: bob, I asked earlier to do X but it didn't execute properly"
echo "=================================================================="
