#!/usr/bin/env bash
# ==============================================================================
# Bob: Automated Installation & Setup Script for Agent Skills and MCP Servers
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=================================================================="
echo "  INSTALLING BOB: FORENSIC AUDIT, MCPs & AGENT SKILLS"
echo "=================================================================="
echo ""

# Helper for colored messaging
log_info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
log_succ()  { echo -e "\033[1;32m[SUCCESS]\033[0m $*"; }
log_warn()  { echo -e "\033[1;33m[WARN]\033[0m $*"; }
log_err()   { echo -e "\033[1;31m[ERROR]\033[0m $*"; }

# 1. Environment & Prerequisites Check
log_info "1/5: Checking system prerequisites (Node, Cargo, Git)..."

if ! command -v git &>/dev/null; then
    log_err "Git is required. Please install Git first."
    exit 1
fi

if ! command -v node &>/dev/null; then
    log_err "Node.js (>= 18) is required. Please install Node.js."
    exit 1
fi

if ! command -v npm &>/dev/null; then
    log_err "npm is required. Please install npm."
    exit 1
fi

log_succ "Core environment dependencies found."
echo ""

# 2. Install Bob Core Skill and Rules to Cursor
log_info "2/5: Linking Bob skill & trigger rules into Cursor..."

CURSOR_SKILLS_DIR="${HOME}/.cursor/skills/bob"
CURSOR_RULES_DIR="${HOME}/.cursor/rules"

mkdir -p "$CURSOR_SKILLS_DIR" "$CURSOR_RULES_DIR"

cp "$REPO_ROOT/skills/bob/SKILL.md" "$CURSOR_SKILLS_DIR/SKILL.md"
cp "$REPO_ROOT/rules/bob.mdc" "$CURSOR_RULES_DIR/bob.mdc"

log_succ "Bob skill installed to: $CURSOR_SKILLS_DIR/SKILL.md"
log_succ "Bob rule installed to:  $CURSOR_RULES_DIR/bob.mdc"
echo ""

# 3. Install Token-Saving CLI Drivers (rtk & context-mode)
log_info "3/5: Installing token-saving CLI proxy & context virtualizers..."

if command -v cargo &>/dev/null; then
    if ! command -v rtk &>/dev/null; then
        log_info "Installing rtk (CLI stdout compression proxy)..."
        cargo install rtk-cli || cargo install rtk || log_warn "Could not install rtk via cargo, skipping."
    else
        log_succ "rtk is already installed: $(rtk --version 2>/dev/null || echo 'ready')"
    fi
else
    log_warn "Rust/Cargo not detected. Skipping optional rtk install."
fi

log_info "Installing mksglu/context-mode globally..."
npm install -g context-mode || log_warn "Failed to install context-mode globally. Can still run via npx."

log_succ "Token optimization layer configured."
echo ""

# 4. Install Alibaba Open Code Review
log_info "4/5: Installing Alibaba Open Code Review CLI (ocr)..."
npm install -g @alibaba-group/open-code-review || log_warn "Could not install @alibaba-group/open-code-review globally. Can be run via npx."
log_succ "Code review drivers configured."
echo ""

# 5. MCP Configuration Instructions
log_info "5/5: Preparing MCP configuration instructions..."

CONFIG_TEMPLATE="$REPO_ROOT/mcp-config.example.json"
echo ""
echo "------------------------------------------------------------------"
echo "  NEXT STEP: ADD BOB MCPs TO YOUR CURSOR / CLAUDE CONFIG"
echo "------------------------------------------------------------------"
echo "Copy the server entries from: $CONFIG_TEMPLATE"
echo "into your Cursor Settings -> Features -> MCP or Claude config:"
echo ""
cat "$CONFIG_TEMPLATE"
echo ""
echo "=================================================================="
log_succ "Bob is fully installed and ready to audit."
echo "Invoke in chat with: 'bob, I asked earlier to do X but it didn't execute properly'"
echo "=================================================================="
