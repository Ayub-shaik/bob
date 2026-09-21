# Bob — Forensic Audit, Anti-Regression & Autonomic Agent Pipeline

> **"You broke Y while doing X" ends here.**

Bob is an open-source **lightweight agent skill + CLI toolkit** that supervises AI coding agents (Cursor, Claude Code, Codex, Windsurf, OpenCode, and generic MCP hosts). It enforces empirical verification, causal feedback-loop tracing, and invariant locks — so agents stop rubber-stamping shallow work and breaking unrelated code.
> **Honestly speaking, I have the idea and orchestrated bob's creation through cursor, checked each iteration on my own other app development work, created because i was fedup with few AI agent's work even when selecting good models and given detailed prompts, tried many skills and combinations but it still does shallow work or breaks 10 things when fixing one. And also token usage was immensly increasing even with rtk, caveman, memory skills/mcp's are involved. So bob as in bob the builder, have many skills integrated and thse skills are clubbed as combos, see that in the skill architecture.
You are open to use this, and suggest any improvements.**

**Design:** Bob ships a small **core** (skill + rules + local telemetry). Heavy optional drivers (`graft`, `rtk`, `context-mode`, …) are **called when needed** via `bob-ensure <tool>` or `npx -y` — never bulk-installed at setup.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

**Read first:** [DISCLAIMER.md](DISCLAIMER.md) · [TERMS.md](TERMS.md) — use at your own risk; you remain responsible for all code shipped.

---

## What Bob Does (Short)

| Problem | Bob's answer |
|--------|----------------|
| Agent fixes A, breaks B/C | Blast-radius tracing + invariant locks before edits |
| Context window bloat | AST crux reads + output virtualization (`rtk`, `context-mode`) |
| "Done" but UI still jumps | Causal loop tracing; mock unit tests disqualified as proof |
| Chat amnesia | Forensic intent harvest from requirements + git reality |
| No visibility into savings | Local telemetry ledger (`~/.bob/telemetry/events.jsonl`) |

---

## Architecture (Interactive)

Bob is a **column switchboard** (not a circular ring): Layer A drivers feed Layer B combos, combos have an explicit **B↔B peer mesh**, and everything streams into Core C.

| Tier | Role |
|------|------|
| **Layer A** | Raw drivers (`rtk`, `graft`, `oxlint`, `mnemosyne`, …) |
| **Layer B** | 15 subspace combos (Token Diet, AST Graph, Causal Loop, …) with **orange B↔B cross-links** |
| **Core C** | Contract & Loss Gate · Forensic & Causal Kernel |

**Interactive diagram** — drag boxes (connectors follow underneath), Ctrl+scroll or +/- zoom, hover = tubelight trace on that box’s lines, click = full node data:

| Open | Where |
|------|--------|
| Repo | [`diagrams/architecture.html`](diagrams/architecture.html) — clone and open in any browser |
| Local dashboard | `bob-dashboard` then `http://localhost:4242/architecture` |
| Live hub | [TomorrowTools Telemetry → Bob](https://telemetry.tomorrowtools.dev/?view=bob) |

No static PNG/JPG architecture images in this repo — the HTML graph is the only diagram.

---

## Quick Install (Any Platform)

```bash
git clone https://github.com/Ayub-shaik/bob.git
cd bob
chmod +x scripts/install.sh scripts/check-mcp.sh bin/*
./scripts/install.sh
```

This installs **core only**:

- `~/.cursor/skills/bob/SKILL.md` + rules (`bob.mdc`, `token-diet.mdc`, `empirical-verification-invariants.mdc`)
- `~/.claude/skills/bob/SKILL.md`
- `~/.local/bin/bob`, `bob-telemetry`, `bob-dashboard`, `bob-ensure`

Does **not** bulk-install npm/cargo tools or edit your MCP config. When a task needs a driver:

```bash
bob-ensure rtk          # or: context-mode | oxlint | graft | mnemosyne
```

**Diagnostic (optional drivers present?):**

```bash
./scripts/check-mcp.sh
```

---

## Use with Your AI Environment

### Cursor (recommended)

1. Run `./scripts/install.sh` (core only).
2. **Optional:** wire MCP servers you actually use from [mcp-config.example.json](mcp-config.example.json).
3. Invoke in chat:
   - `bob, I asked earlier to do X but it didn't execute properly`
   - `bob audit this scroll behavior`
   - `/bob check the last commit for regressions`

Bob's rule (`bob.mdc`) is **always-on** when installed — saying `bob` or `/bob` activates the full forensic procedure.

### Claude Code / Claude Desktop

```bash
# Skill (already copied by install.sh)
ls ~/.claude/skills/bob/SKILL.md

# Or manual:
mkdir -p ~/.claude/skills/bob
cp skills/bob/SKILL.md ~/.claude/skills/bob/SKILL.md
```

Add MCP entries to `claude_desktop_config.json` (same shape as `mcp-config.example.json`).

### OpenAI Codex / CLI agents

Bob is environment-agnostic. Install the skill text into your agent's skill directory, or paste `skills/bob/SKILL.md` into system/context instructions.

```bash
# Standalone forensic git audit (no IDE required)
./bin/bob-audit
```

### Windsurf, OpenCode, Continue, Zed, etc.

1. Copy `skills/bob/SKILL.md` into that product's skills or rules folder.
2. Copy `rules/bob.mdc` if the host supports Cursor-style rules.
3. Wire MCP servers from `mcp-config.example.json`.

### Generic MCP providers (OmniRoute, custom gateways, local routers)

Bob does **not** require a specific vendor. Any host that supports:

- User rules / skills (markdown instructions)
- MCP tool servers (`graft`, `mnemosyne`, `context-mode`, code-review)

…can run Bob. Point MCP `command`/`args` at locally installed binaries; no cloud dependency.

---

## Telemetry (Local Only)

Bob records turn metrics on **your machine**:

| Path | Purpose |
|------|---------|
| `~/.bob/telemetry/events.jsonl` | Append-only turn ledger |
| `bob stats --all` | Terminal summary |
| `bob-dashboard --open` | Local web UI (port 4242) |

**Log a turn manually:**

```bash
bob-telemetry log \
  --query "Fix scroll snap on home map" \
  --used 4200 \
  --saved 38000 \
  --category "causal-fix" \
  --tools "graft,oxlint,cdp-trace" \
  --model "your-model"
```

**Agents should log automatically** at the end of each Bob audit (see Step 4 in `skills/bob/SKILL.md`).

```bash
bob-telemetry clear   # wipe local ledger
```

No telemetry is sent to any remote server unless **you** integrate your own dashboard.

---

## The 4-Step Forensic Procedure

1. **Historical intent harvest** — user speech, `REQUIREMENTS.md`, git reality  
2. **Large-repo triage** — Graft cruxes, blast radius, fast lint preflight, build log virtualization  
3. **Causal loop trace** — scroll/gesture feedback, compositor cost, touch release physics  
4. **Surgical correction + telemetry** — numbered `FIX-001` orders, acceptance gate, `bob-telemetry log`

Full spec: [skills/bob/SKILL.md](skills/bob/SKILL.md)

---

## Token Economics (Typical)

| Step | Traditional agent | Bob pipeline | Savings |
|------|-------------------|--------------|---------|
| Locate code | Read 3–5 full files | `graft_find_code` crux | ~97% |
| Caller context | Read caller files | `graft_trace_calls` | ~97% |
| Build output | Raw stdout flood | `rtk` + log tail | ~90% |
| Fix delivery | 400-line rewrite | Surgical `StrReplace` | ~88% |
| Rework loops | 2–3 broken passes | Invariant lock | often 100% |

Figures are illustrative; measure with `bob stats`.

---

## Repository Layout

```
bob/
├── README.md                 # This file
├── LICENSE                   # MIT
├── DISCLAIMER.md             # Use-at-your-own-risk notice
├── TERMS.md                  # Terms of use
├── CONTRIBUTING.md
├── mcp-config.example.json
├── scripts/
│   ├── install.sh            # One-step installer
│   └── check-mcp.sh          # Driver diagnostic
├── bin/
│   ├── bob-telemetry         # CLI ledger (also `bob`)
│   ├── bob-dashboard         # Local web dashboard
│   ├── bob-ensure            # On-demand optional driver install
│   └── bob-audit             # Standalone git/invariant audit
├── skills/bob/SKILL.md       # Core forensic skill
├── rules/
│   ├── bob.mdc               # Always-on trigger (Cursor)
│   ├── token-diet.mdc        # Read/build log caps
│   └── empirical-verification-invariants.mdc
└── diagrams/
    ├── architecture.html     # Interactive graph (open in browser)
    ├── bob-graph.js          # Draggable boxes, zoom, tubelight hover
    └── bob-graph-data.js     # Drivers, 15 combos, B↔B mesh, Core C
```

---

## MCP Configuration

```json
{
  "mcpServers": {
    "graft": { "command": "graft", "args": ["mcp"] },
    "mnemosyne": { "command": "mnemosyne", "args": ["mcp"] },
    "context-mode": { "command": "npx", "args": ["-y", "context-mode"] },
    "code-review": {
      "command": "npx",
      "args": ["-y", "@alibaba-group/open-code-review", "mcp"]
    }
  }
}
```

See [mcp-config.example.json](mcp-config.example.json) for descriptions.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome for new Layer A drivers, combo wiring docs, and host-specific install notes.

---

## License

[MIT License](LICENSE) — Copyright (c) 2026 Shaik.
