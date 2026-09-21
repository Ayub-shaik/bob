/**
 * Upstream source repos + elaborated what/how for every graph node.
 * Keys: Layer A/C by node.name; Layer B by node.id (B1…) or node.name.
 */
(function (global) {
  const BOB = "https://github.com/Ayub-shaik/bob";

  const CATALOG = {
    // ── Layer A drivers ──────────────────────────────────────────────
    rtk: {
      repo: "https://crates.io/crates/rtk-cli",
      repoLabel: "rtk-cli (Rust)",
      what: "Stdout compression proxy that summarizes noisy CLI output before it enters the agent context window.",
      how: "Bob Step 1.5 prefers `rtk <cmd>` for Gradle, Docker, and test runs; `bob-ensure rtk` installs via cargo when missing. Falls back to `/tmp/` redirect + `tail -25`.",
    },
    "context-mode": {
      repo: "https://github.com/mksglu/context-mode",
      repoLabel: "mksglu/context-mode",
      what: "Virtualizes large tool outputs into indexed chunks the agent fetches on demand instead of inlining blobs.",
      how: "Wired in `token-diet.mdc` and `mcp-config.example.json`. Bob uses `ctx_execute` / `ctx_search` when MCP is connected; otherwise summarizes tails only.",
    },
    "apk-builder": {
      repo: `${BOB}/blob/master/bin/bob-ensure`,
      repoLabel: "bob · build virtualization",
      what: "Gradle/APK log virtualizer — redirects multi-thousand-line native builds to disk and surfaces exit code + error tail only.",
      how: "Bob Step 1.5 mandates build output virtualization in `skills/bob/SKILL.md`; pairs with homelab RAM scripts in consuming repos (e.g. `scripts/build-android-native.sh`).",
    },
    graft: {
      repo: "https://github.com/NanoNets/context-graph-engine",
      repoLabel: "NanoNets/context-graph-engine",
      what: "Prebuilt AST graph indexer — symbol spans, crux excerpts, and caller/callee traces without whole-file reads.",
      how: "Bob Step 1.5: `graft ask`, `graft_find_code`, `graft_trace_calls` before opening files. Installed via `bob-ensure graft` (`npm i -g @nanonets/graft`).",
    },
    "ast-crux": {
      repo: "https://github.com/NanoNets/context-graph-engine",
      repoLabel: "NanoNets/context-graph-engine · crux reads",
      what: "≤8-line function/symbol excerpt extracted from the graft graph — the only allowed default read shape.",
      how: "Enforced by `graft-code-map.mdc` (80-line hard cap). Bob never reads a full file when a crux span exists.",
    },
    "d3-physics": {
      repo: "https://github.com/d3/d3",
      repoLabel: "d3/d3",
      what: "Force/layout helpers for spatial graph views (telemetry hub + standalone diagram).",
      how: "Used in `diagrams/bob-graph.js` for pan/zoom transforms and edge routing — not for runtime agent decisions.",
    },
    oxlint: {
      repo: "https://github.com/oxc-project/oxc",
      repoLabel: "oxc-project/oxc (oxlint)",
      what: "Sub-50ms Rust linter for JS/TS — catches syntax and many logic issues without a full compile.",
      how: "Bob Step 1.5 static preflight via `npx -y oxlint` or `bob-ensure oxlint`. Wired in `scripts/install.sh` diagnostics and consumer `package.json` `lint:fast`.",
    },
    "tsc-fast": {
      repo: "https://github.com/microsoft/TypeScript",
      repoLabel: "microsoft/TypeScript",
      what: "`tsc --noEmit` typecheck pass without emitting JS — catches type regressions early.",
      how: "Bob runs `tsc --noEmit` on TS edits before acceptance; failure blocks Pass even when oxlint is clean.",
    },
    "find-skills": {
      repo: "https://github.com/vercel-labs/skills",
      repoLabel: "skills discovery (Cursor)",
      what: "On-demand skill discovery so new Layer A drivers register without bloating always-on context.",
      how: "Bob references `find-skills` when a task needs a domain skill not yet installed; keeps core Bob skill repo-agnostic.",
    },
    mnemosyne: {
      repo: `${BOB}/blob/master/mcp-config.example.json`,
      repoLabel: "mnemosyne (MCP)",
      what: "Cross-session project memory — recalls decisions, blockers, and runbooks with project prefixes.",
      how: "Bob Step 1.5: `mnemosyne_recall` before architecture work; `mnemosyne_remember` after meaningful decisions. Installed via `bob-ensure mnemosyne`.",
    },
    weknora: {
      repo: "https://github.com/Tencent/WeKnora",
      repoLabel: "Tencent/WeKnora",
      what: "RAG doc chunker for dense specs, READMEs, and long requirements files.",
      how: "Feeds Memory Bus (B12) when agents must ground answers in uploaded docs instead of guessing API shapes.",
    },
    "mem-decay": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · memory hygiene",
      what: "Invalidates superseded Mnemosyne memories when git or REQUIREMENTS change the contract.",
      how: "Bob compares recall timestamps against `DEVELOPMENT_LOG.md` / git HEAD; stale memories are ignored or overwritten on store.",
    },
    "spec-lock": {
      repo: `${BOB}/blob/master/rules/bob.mdc`,
      repoLabel: "bob · invariant lock",
      what: "Locks `.cursor/REQUIREMENTS.md` as the acceptance contract — scope cannot shrink silently.",
      how: "Pairs with global `requirements-checklist.mdc`. Bob Step 1 harvests checklist rows; Step 3 flags scope shrink as Surface Mimicry.",
    },
    "git-guard": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · git safety",
      what: "Blocks destructive git operations (force-push, hard reset, skip hooks) unless the user explicitly requests them.",
      how: "Enforced in user rules + Bob Step 2 `git diff` reality check. Bob never amends pushed commits without user approval.",
    },
    superlogic: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · retry breaker",
      what: "Caps correction loops at two rework passes before escalating to the user.",
      how: "Aligns with `workflow-pipeline.mdc` and `task-supervisor` — prevents infinite trial-and-error oscillation.",
    },
    "cdp-trace": {
      repo: "https://chromedevtools.github.io/devtools-protocol/",
      repoLabel: "Chrome DevTools Protocol",
      what: "Browser layout/paint/scroll profiler — captures real reflow feedback loops in Chromium.",
      how: "Bob Step 2 Causal Loop trace: CDP `Runtime.evaluate`, layout metrics, scrollY samples. Disqualifies jsdom-only proof.",
    },
    "dual-scroll": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · dual-scroll invariant",
      what: "Detector for nested `overflow-y-auto` fighting `window.scrollY` — a fatal gesture conflict.",
      how: "Bob Step 2 flags competing scroll containers; fix is always a single scroll owner per gesture target.",
    },
    "re-anchor": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · scroll re-anchor",
      what: "After sticky map shrink changes document height, re-anchors `scrollY` to `stickY + past` so layout edits cannot ping-pong.",
      how: "Implemented in consumer repos (e.g. `homeMapScrollAnchorY`); Bob audits call sites when scroll jitter is reported.",
    },
    "reflow-guard": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · reflow guard",
      what: "Blocks `height` / `margin` mutations inside active scroll listeners unless isolated from sticky anchor math.",
      how: "Bob Step 2 traces Mutation → Reflow → Secondary scroll event; violations become FIX orders to B4/B13.",
    },
    "cua-driver": {
      repo: "https://github.com/trycua/cua",
      repoLabel: "trycua/cua",
      what: "Computer-use 2.0 desktop/browser automation — accessibility trees, screenshots, safe UI actions.",
      how: "Bob Step 1.5 physical UI falsification when CDP or ARTEMIS is insufficient; `bob-ensure` documents install path.",
    },
    artemis: {
      repo: "https://github.com/Ayub-shaik/bob/blob/master/mcp-config.example.json",
      repoLabel: "ARTEMIS (MCP)",
      what: "Android UI automation — `uiautomator` dumps, screencaps, and autonomous on-device tasks.",
      how: "Bob uses `mobile_get_device_state` / `mobile_run_task` for native parity audits; complements Playwright for web.",
    },
    "tap-inertia": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · touch physics",
      what: "Zero-velocity release check — finger held stationary after drag must not trigger springback or snap.",
      how: "Bob Step 2 Gesture Trace: constructs adversarial scenario (drag 40px, hold, release at velocity≈0) before declaring Pass.",
    },
    playwright: {
      repo: "https://github.com/microsoft/playwright",
      repoLabel: "microsoft/playwright",
      what: "Headless/headed browser automation for multi-step flows and viewport matrix checks.",
      how: "Bob empirical audit at responsive breakpoints; results are State Reality evidence, not a substitute for on-device QA.",
    },
    recordly: {
      repo: "https://github.com/webadderallorg/Recordly",
      repoLabel: "webadderallorg/Recordly",
      what: "Polished screen recordings with auto-zoom and cursor smoothing for demo evidence.",
      how: "Bob Step 1.5 visual artifact protocol — captures proof clips when the deliverable is UX, not just code diff.",
    },
    "adb-bridge": {
      repo: "https://developer.android.com/tools/adb",
      repoLabel: "Android platform-tools (adb)",
      what: "Install, launch, `uiautomator dump`, and logcat bridge for native APK verification.",
      how: "Bob Android waves: `adb install -r`, `am start`, dump bounds to falsify layout claims empirically.",
    },
    ocr: {
      repo: "https://github.com/getcursor/cursor",
      repoLabel: "Cursor · code review",
      what: "Line-level diff review pipeline (Bugbot / review agents) scanning for regressions and unrelated churn.",
      how: "Feeds Audit Pipeline (B11) on every non-trivial diff; Bob rejects drive-by refactors in FIX orders.",
    },
    ponytail: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · diff bloat guard",
      what: "Flags oversized diffs and unrelated file churn relative to the stated FIX scope.",
      how: "Bob Step 3 Surface Mimicry: if diff touches locked modules or >N files without justification, order surgical split.",
    },
    bugbot: {
      repo: "https://cursor.com/docs/bugbot",
      repoLabel: "Cursor Bugbot",
      what: "Automated PR/code review agent focused on defects, security, and invariant violations.",
      how: "Optional Layer A driver in Audit Pipeline; invoked explicitly via `/bugbot` or review skill — not always-on.",
    },
    worktrunk: {
      repo: "https://github.com/jdx/worktrunk",
      repoLabel: "jdx/worktrunk",
      what: "Git worktree manager for isolated experiments without dirtying the primary branch.",
      how: "Worktree ISO (B8): risky builds and best-of-N attempts run in disposable worktrees; merge only after acceptance Pass.",
    },
    "ram-tier": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · degradation tiers",
      what: "Reads available RAM / device tier and degrades glass, blur, and physics effects on constrained hardware.",
      how: "Resource-Constrained Degradation Invariant in Bob skill — ≤3GB RAM must still hit 60 FPS on scroll surfaces.",
    },
    quickliquid: {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · glass fallback",
      what: "Frosted-glass UI with CSS fallback when `backdrop-filter` or GPU compositing is too expensive.",
      how: "Compositor Guard (B14) pairs with Hardware Tier (B10); Bob audits blur over scrolling map surfaces.",
    },
    "perf-fps": {
      repo: "https://developer.chrome.com/docs/devtools/performance",
      repoLabel: "Chrome Performance panel",
      what: "Frame rate and compositor thread monitor — catches jank on scroll surfaces.",
      how: "Bob Step 2 Compositor Trace: flags `filter`/`blur` on elements that scroll with the finger.",
    },
    firecrawl: {
      repo: "https://github.com/mendableai/firecrawl",
      repoLabel: "mendableai/firecrawl",
      what: "Structured web/doc fetcher — retrieves real API docs instead of hallucinated endpoints.",
      how: "Static Preflight (B9): verify external API shapes before codegen; MCP `firecrawl_scrape` when configured.",
    },
    "vitest-runner": {
      repo: "https://github.com/vitest-dev/vitest",
      repoLabel: "vitest-dev/vitest",
      what: "Fast unit test runner for pure logic — math, parsers, state machines.",
      how: "Bob allows vitest for non-UI invariants only; **mock tests are disqualified** as proof of scroll/gesture correctness.",
    },

    // ── Layer B combos (keyed by id and name) ────────────────────────
    B1: {
      repo: `${BOB}/blob/master/rules/token-diet.mdc`,
      repoLabel: "bob · Token Diet",
      what: "Subspace that virtualizes CLI output and caps file reads so context stays under budget.",
      how: "Aggregates rtk, context-mode, apk-builder. Always-on via `token-diet.mdc`; links B2 (AST Graph) and B7 (Blast Radius) for compact reads.",
    },
    "Token Diet": {
      repo: `${BOB}/blob/master/rules/token-diet.mdc`,
      repoLabel: "bob · Token Diet",
      what: "Subspace that virtualizes CLI output and caps file reads so context stays under budget.",
      how: "Aggregates rtk, context-mode, apk-builder. Always-on via `token-diet.mdc`; links B2 (AST Graph) and B7 (Blast Radius) for compact reads.",
    },
    B2: {
      repo: `${BOB}/blob/master/rules/graft-code-map.mdc`,
      repoLabel: "bob · AST Graph",
      what: "Deterministic symbol orientation — crux reads and caller trees without LLM file dumps.",
      how: "Graft MCP + ast-crux + d3 layout. Every edit anchors to a `covers:` span; links B7 and B15.",
    },
    "AST Graph": {
      repo: `${BOB}/blob/master/rules/graft-code-map.mdc`,
      repoLabel: "bob · AST Graph",
      what: "Deterministic symbol orientation — crux reads and caller trees without LLM file dumps.",
      how: "Graft MCP + ast-crux + d3 layout. Every edit anchors to a `covers:` span; links B7 and B15.",
    },
    B3: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Invariant Lock",
      what: "Locks REQUIREMENTS.md and `.mdc` rules as non-negotiable pipeline law.",
      how: "spec-lock + git-guard + superlogic. Links B6 (State Reality) and B11 (Audit Pipeline).",
    },
    "Invariant Lock": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Invariant Lock",
      what: "Locks REQUIREMENTS.md and `.mdc` rules as non-negotiable pipeline law.",
      how: "spec-lock + git-guard + superlogic. Links B6 (State Reality) and B11 (Audit Pipeline).",
    },
    B4: {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Causal Loop",
      what: "Breaks scroll/layout feedback oscillations by tracing closed-loop causality.",
      how: "cdp-trace + dual-scroll + re-anchor. Links B13 (Reflow Shield) and B5 (Gesture Trace).",
    },
    "Causal Loop": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Causal Loop",
      what: "Breaks scroll/layout feedback oscillations by tracing closed-loop causality.",
      how: "cdp-trace + dual-scroll + re-anchor. Links B13 (Reflow Shield) and B5 (Gesture Trace).",
    },
    B5: {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Gesture Trace",
      what: "Touch velocity, zero-velocity release, and gesture-ownership physics.",
      how: "cua-driver + artemis + tap-inertia. Links B4 and B10 for scroll + hardware tier checks.",
    },
    "Gesture Trace": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Gesture Trace",
      what: "Touch velocity, zero-velocity release, and gesture-ownership physics.",
      how: "cua-driver + artemis + tap-inertia. Links B4 and B10 for scroll + hardware tier checks.",
    },
    B6: {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · State Reality",
      what: "Browser/device proof over mock tests — reported failure = broken by definition.",
      how: "recordly + playwright + adb-bridge. Links B3 and B11; disqualifies jsdom-only Pass claims.",
    },
    "State Reality": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · State Reality",
      what: "Browser/device proof over mock tests — reported failure = broken by definition.",
      how: "recordly + playwright + adb-bridge. Links B3 and B11; disqualifies jsdom-only Pass claims.",
    },
    B7: {
      repo: `${BOB}/blob/master/rules/graft-code-map.mdc`,
      repoLabel: "bob · Blast Radius",
      what: "Transitive caller/callee impact analysis before any rename or signature change.",
      how: "`graft_trace_calls` within 3 hops. Links B2 and B15 so Surgical Fixer knows dependents.",
    },
    "Blast Radius": {
      repo: `${BOB}/blob/master/rules/graft-code-map.mdc`,
      repoLabel: "bob · Blast Radius",
      what: "Transitive caller/callee impact analysis before any rename or signature change.",
      how: "`graft_trace_calls` within 3 hops. Links B2 and B15 so Surgical Fixer knows dependents.",
    },
    B8: {
      repo: "https://github.com/jdx/worktrunk",
      repoLabel: "bob · Worktree ISO",
      what: "Isolated git worktrees for experiments and parallel agent attempts.",
      how: "worktrunk driver. Links B1 + B6 — risky builds never dirty primary branch.",
    },
    "Worktree ISO": {
      repo: "https://github.com/jdx/worktrunk",
      repoLabel: "bob · Worktree ISO",
      what: "Isolated git worktrees for experiments and parallel agent attempts.",
      how: "worktrunk driver. Links B1 + B6 — risky builds never dirty primary branch.",
    },
    B9: {
      repo: `${BOB}/blob/master/scripts/check-mcp.sh`,
      repoLabel: "bob · Static Preflight",
      what: "Sub-50ms lint/type/doc checks before compile or commit.",
      how: "oxlint + tsc-fast + firecrawl + find-skills. Links B1 and B11.",
    },
    "Static Preflight": {
      repo: `${BOB}/blob/master/scripts/check-mcp.sh`,
      repoLabel: "bob · Static Preflight",
      what: "Sub-50ms lint/type/doc checks before compile or commit.",
      how: "oxlint + tsc-fast + firecrawl + find-skills. Links B1 and B11.",
    },
    B10: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Hardware Tier",
      what: "Degrades expensive effects on low-RAM or reduced-motion devices.",
      how: "ram-tier + quickliquid + perf-fps. Links B5 and B14.",
    },
    "Hardware Tier": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Hardware Tier",
      what: "Degrades expensive effects on low-RAM or reduced-motion devices.",
      how: "ram-tier + quickliquid + perf-fps. Links B5 and B14.",
    },
    B11: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Audit Pipeline",
      what: "OCR + diff bloat + security scan on every meaningful diff.",
      how: "ocr + ponytail + bugbot. Links B7 and B3 — unrelated churn is rejected.",
    },
    "Audit Pipeline": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Audit Pipeline",
      what: "OCR + diff bloat + security scan on every meaningful diff.",
      how: "ocr + ponytail + bugbot. Links B7 and B3 — unrelated churn is rejected.",
    },
    B12: {
      repo: `${BOB}/blob/master/mcp-config.example.json`,
      repoLabel: "bob · Memory Bus",
      what: "Mnemosyne recall + doc chunking + stale memory hygiene.",
      how: "mnemosyne + weknora + mem-decay. Links B3 so decisions stay project-scoped.",
    },
    "Memory Bus": {
      repo: `${BOB}/blob/master/mcp-config.example.json`,
      repoLabel: "bob · Memory Bus",
      what: "Mnemosyne recall + doc chunking + stale memory hygiene.",
      how: "mnemosyne + weknora + mem-decay. Links B3 so decisions stay project-scoped.",
    },
    B13: {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Reflow Shield",
      what: "Blocks height edits during active scroll; re-anchors after shrink.",
      how: "reflow-guard + re-anchor. Links B4 exclusively.",
    },
    "Reflow Shield": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Reflow Shield",
      what: "Blocks height edits during active scroll; re-anchors after shrink.",
      how: "reflow-guard + re-anchor. Links B4 exclusively.",
    },
    B14: {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Compositor Guard",
      what: "GPU/filter cost control over scrolling surfaces.",
      how: "perf-fps + quickliquid. Links B10.",
    },
    "Compositor Guard": {
      repo: `${BOB}/blob/master/rules/empirical-verification-invariants.mdc`,
      repoLabel: "bob · Compositor Guard",
      what: "GPU/filter cost control over scrolling surfaces.",
      how: "perf-fps + quickliquid. Links B10.",
    },
    B15: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Surgical Fixer",
      what: "Minimal `StrReplace` / targeted edits — never whole-file rewrites unless approved.",
      how: "Receives FIX-001 orders from Core C2 via B2 + B7 blast-radius context.",
    },
    "Surgical Fixer": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Surgical Fixer",
      what: "Minimal `StrReplace` / targeted edits — never whole-file rewrites unless approved.",
      how: "Receives FIX-001 orders from Core C2 via B2 + B7 blast-radius context.",
    },

    // ── Core C kernels ─────────────────────────────────────────────────
    C1: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · requirements-manager + acceptance-review",
      what: "Contract & Loss Gate — halts the pipeline when any checklist row or invariant fails.",
      how: "Global `requirements-checklist.mdc` + `acceptance-review` skill. Sole Pass/Fail authority; loss = 0 gate.",
    },
    "Contract & Loss Gate": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · requirements-manager + acceptance-review",
      what: "Contract & Loss Gate — halts the pipeline when any checklist row or invariant fails.",
      how: "Global `requirements-checklist.mdc` + `acceptance-review` skill. Sole Pass/Fail authority; loss = 0 gate.",
    },
    C2: {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Forensic Kernel",
      what: "Forensic & Causal Kernel — traces failure modes and emits numbered FIX orders.",
      how: "Bob skill Step 1–4 + `task-supervisor`. Routes fixes to B15; reported UI failure = broken by definition.",
    },
    "Forensic & Causal Kernel": {
      repo: `${BOB}/blob/master/skills/bob/SKILL.md`,
      repoLabel: "bob · Forensic Kernel",
      what: "Forensic & Causal Kernel — traces failure modes and emits numbered FIX orders.",
      how: "Bob skill Step 1–4 + `task-supervisor`. Routes fixes to B15; reported UI failure = broken by definition.",
    },
  };

  function lookup(node) {
    if (!node) return null;
    return CATALOG[node.name] || CATALOG[node.id] || null;
  }

  global.BobGraphCatalog = { CATALOG, lookup };
})(typeof window !== "undefined" ? window : globalThis);
