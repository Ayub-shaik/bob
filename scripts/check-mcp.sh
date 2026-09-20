#!/usr/bin/env bash
# ==============================================================================
# Bob: MCP Server Connectivity Health Check & Diagnostic Tool
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo "  BOB MCP SERVERS & DRIVER CONNECTIVITY DIAGNOSTIC"
echo "=================================================================="
echo ""

check_tool() {
    local name="$1"
    local cmd="$2"
    echo -n "  Checking $name... "
    local target_cmd=""
    if command -v "$cmd" &>/dev/null; then
        target_cmd="$cmd"
    elif [ -e "$HOME/.local/bin/$cmd" ] || [ -L "$HOME/.local/bin/$cmd" ]; then
        target_cmd="$HOME/.local/bin/$cmd"
    fi

    if [ -n "$target_cmd" ]; then
        local version_str
        version_str=$("$target_cmd" --version 2>/dev/null || echo 'ready')
        echo -e "\033[1;32m[INSTALLED]\033[0m ($version_str)"
    else
        echo -e "\033[1;33m[NOT DETECTED]\033[0m (Run ./scripts/install.sh to configure)"
    fi
}

echo "[1/3] CLI Proxies & Token Compressors:"
check_tool "rtk (CLI token proxy)" "rtk"
check_tool "context-mode (virtualizer)" "context-mode"
check_tool "worktrunk (git worktrees)" "wt"
echo ""

echo "[2/3] Code Review & Static Pipeline Engines:"
check_tool "Alibaba Open Code Review (ocr)" "ocr"
echo ""

echo "[3/3] Local MCP Servers (Graft & Mnemosyne):"
check_tool "Graft Codebase AST Graph" "graft"
check_tool "Mnemosyne Memory System" "mnemosyne"
echo ""

echo "=================================================================="
echo "Diagnostic complete. If any server is missing, see README.md."
echo "=================================================================="
