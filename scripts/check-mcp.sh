#!/usr/bin/env bash
# ==============================================================================
# Bob: Optional driver diagnostic (read-only — does not install anything)
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo "  BOB OPTIONAL DRIVERS (diagnostic only)"
echo "=================================================================="
echo ""
echo "Bob core works without any of these. Install on demand: bob-ensure <tool>"
echo ""

resolve_cmd() {
  local cmd="$1"
  if command -v "$cmd" &>/dev/null; then
    command -v "$cmd"
  elif [ -x "${HOME}/.local/bin/${cmd}" ]; then
    echo "${HOME}/.local/bin/${cmd}"
  else
    echo ""
  fi
}

check_tool() {
  local name="$1"
  local cmd="$2"
  echo -n "  $name... "
  local target
  target="$(resolve_cmd "$cmd")"
  if [ -z "$target" ]; then
    echo -e "\033[1;33mmissing\033[0m (bob-ensure $cmd)"
    return
  fi
  if [ ! -e "$target" ] || [ -L "$target" ] && [ ! -e "$target" ]; then
    echo -e "\033[1;33mbroken symlink\033[0m ($target — bob-ensure $cmd)"
    return
  fi
  local ver=""
  ver=$("$target" --version 2>/dev/null || true)
  if [ -n "$ver" ]; then
    echo -e "\033[1;32mOK\033[0m ($target, $ver)"
  else
    echo -e "\033[1;32mOK\033[0m ($target)"
  fi
}

echo "[CLI / npm]"
check_tool "rtk" "rtk"
check_tool "context-mode" "context-mode"
check_tool "oxlint" "oxlint"
echo "  oxlint (project)... " 
if [ -f "package.json" ] && grep -q '"oxlint"' package.json 2>/dev/null; then
  echo -e "\033[1;32mOK\033[0m (npm run lint:fast in repo)"
else
  echo -e "\033[1;33muse\033[0m npx -y oxlint or bob-ensure oxlint"
fi
echo ""
echo "[MCP — verify in IDE Settings -> MCP]"
check_tool "graft" "graft"
check_tool "mnemosyne" "mnemosyne"
echo ""
echo "=================================================================="
echo "Core Bob: ~/.cursor/skills/bob/SKILL.md + bob.mdc"
echo "=================================================================="
