/** Bob autonomic network — node specs (column layout, no circular rings). */
(function (global) {
  const COMBOS = [
    { id: "B1", name: "Token Diet", desc: "Virtualizes CLI output and chunks files to cut token use ~92%.", why: "Aggregates rtk, context-mode, apk-builder. Links B2 + B7 for compact symbol reads.", invariant: "No command may dump >100 uncompressed lines into context." },
    { id: "B2", name: "AST Graph", desc: "Deterministic caller/callee trees without LLM reads.", why: "Graft + ast-crux + d3-physics. Links B7 + B15 for surgical edits.", invariant: "Edits anchored to AST cruxes only." },
    { id: "B3", name: "Invariant Lock", desc: "Locks REQUIREMENTS.md and .mdc rules.", why: "spec-lock + git-guard + superlogic. Links B6 + B11.", invariant: "Scope cannot shrink; failed checklist = fail." },
    { id: "B4", name: "Causal Loop", desc: "Breaks scroll/layout feedback oscillations.", why: "CDP trace + dual-scroll + re-anchor. Links B13 + B5.", invariant: "No scrollHeight mutations inside onScroll." },
    { id: "B5", name: "Gesture Trace", desc: "Touch velocity and zero-velocity release physics.", why: "CUA + Artemis + tap-inertia. Links B4 + B10.", invariant: "Zero-velocity release must not snap back." },
    { id: "B6", name: "State Reality", desc: "Browser/device proof over mock tests.", why: "Recordly + Playwright + ADB. Links B3 + B11.", invariant: "Reported UI failure = broken, regardless of unit tests." },
    { id: "B7", name: "Blast Radius", desc: "Transitive caller impact before edits.", why: "Graft + OCR. Links B2 + B15.", invariant: "Check dependents within 3 hops before merge." },
    { id: "B8", name: "Worktree ISO", desc: "Isolated git worktrees for experiments.", why: "worktrunk. Links B1 + B6.", invariant: "Risky builds never dirty primary branch." },
    { id: "B9", name: "Static Preflight", desc: "Sub-50ms lint/type checks before compile.", why: "oxlint + tsc-fast + find-skills. Links B1 + B11.", invariant: "Fast static pass before compile/commit." },
    { id: "B10", name: "Hardware Tier", desc: "Degrades effects on low-RAM devices.", why: "ram-tier + motion-safe + quickliquid. Links B5 + B14.", invariant: "<=3GB RAM must still hit 60 FPS." },
    { id: "B11", name: "Audit Pipeline", desc: "OCR + Ponytail + Bugbot on every diff.", why: "Line-level review. Links B7 + B3.", invariant: "Unrelated churn in diffs is rejected." },
    { id: "B12", name: "Memory Bus", desc: "Mnemosyne recall + stale memory hygiene.", why: "mnemosyne + weknora + mem-decay. Links B3.", invariant: "Memories must be project-scoped and fresh." },
    { id: "B13", name: "Reflow Shield", desc: "Blocks height edits during active scroll.", why: "reflow-guard + re-anchor. Links B4.", invariant: "Height shifts must re-anchor scroll offset." },
    { id: "B14", name: "Compositor Guard", desc: "GPU/filter cost over scrolling surfaces.", why: "perf-fps + quickliquid. Links B10.", invariant: "60 FPS without software raster bottlenecks." },
    { id: "B15", name: "Surgical Fixer", desc: "Minimal StrReplace, not whole-file rewrites.", why: "Orders from Core C via B2 + B7.", invariant: "Surgical edits unless user approves rewrite." },
  ];

  const CORE = [
    { id: "C1", name: "Contract & Loss Gate", desc: "requirements-manager + acceptance-review. Loss = 0 gate.", why: "Halts pipeline when any invariant or checklist item fails.", invariant: "Sole Pass/Fail authority." },
    { id: "C2", name: "Forensic & Causal Kernel", desc: "Bob skill + task-supervisor. Emits FIX-001 orders.", why: "Traces causal loops and routes fixes to B15.", invariant: "Reported failure mode = broken by definition." },
  ];

  const DRIVERS = [
    { name: "rtk", category: "Token Diet", desc: "CLI stdout compression proxy.", why: "Feeds Token Diet + Static Preflight.", invariant: "Virtualize noisy build logs." },
    { name: "context-mode", category: "Token Diet", desc: "Context virtualization anchors.", why: "Keeps working set under budget.", invariant: "No full-file dumps in context." },
    { name: "apk-builder", category: "Token Diet", desc: "Gradle log virtualizer.", why: "APK builds without log flood.", invariant: "Build stdout to disk, tail errors only." },
    { name: "graft", category: "AST Graph", desc: "AST graph + symbol crux indexer.", why: "Feeds AST Graph + Blast Radius.", invariant: "Zero whole-file reads." },
    { name: "ast-crux", category: "AST Graph", desc: "<=8-line function crux extractor.", why: "Token Diet + AST Graph.", invariant: "Crux-only reads." },
    { name: "d3-physics", category: "AST Graph", desc: "Layout/physics for graph views.", why: "Spatial graph layout.", invariant: "Deterministic layout helpers." },
    { name: "oxlint", category: "Static Preflight", desc: "Fast Rust linter.", why: "Preflight + Audit.", invariant: "Lint before compile." },
    { name: "tsc-fast", category: "Static Preflight", desc: "Typecheck without emit.", why: "Catch type regressions early.", invariant: "Zero TS errors before acceptance." },
    { name: "find-skills", category: "Static Preflight", desc: "Discover agent skills on demand.", why: "Wire new Layer A drivers safely.", invariant: "Skills register under Core C." },
    { name: "mnemosyne", category: "Memory Bus", desc: "Cross-session project memory.", why: "Memory Bus + Invariant Lock.", invariant: "Recall scoped decisions." },
    { name: "weknora", category: "Memory Bus", desc: "RAG doc chunker.", why: "Index dense specs.", invariant: "Ground truth docs on demand." },
    { name: "mem-decay", category: "Memory Bus", desc: "Stale memory hygiene.", why: "Invalidate superseded decisions.", invariant: "No contradictory recall." },
    { name: "spec-lock", category: "Invariant Lock", desc: "REQUIREMENTS.md contract lock.", why: "Prevents scope shrink.", invariant: "Checklist is the contract." },
    { name: "git-guard", category: "Invariant Lock", desc: "Blocks destructive git ops.", why: "Preserve history integrity.", invariant: "No blind force-push." },
    { name: "superlogic", category: "Invariant Lock", desc: "2-retry loop breaker.", why: "Stop trial-and-error spirals.", invariant: "Max 2 rework loops." },
    { name: "cdp-trace", category: "Causal Loop", desc: "CDP layout/paint profiler.", why: "Catch scroll reflow loops.", invariant: "No sticky threshold jitter." },
    { name: "dual-scroll", category: "Causal Loop", desc: "Nested scroll collision detector.", why: "Eliminate fighting containers.", invariant: "One scroll owner per gesture." },
    { name: "re-anchor", category: "Reflow Shield", desc: "Scroll re-anchor after shrink.", why: "Prevent layout ping-pong.", invariant: "Re-anchor after height edits." },
    { name: "reflow-guard", category: "Reflow Shield", desc: "Blocks dimension edits in onScroll.", why: "Break feedback loops.", invariant: "No layout mutation in scroll handlers." },
    { name: "cua-driver", category: "Gesture Trace", desc: "Desktop/browser automation.", why: "Empirical UI verification.", invariant: "Real interaction proof." },
    { name: "artemis", category: "Gesture Trace", desc: "Android UI automation.", why: "Hardware UI hierarchies.", invariant: "Verify on real devices." },
    { name: "tap-inertia", category: "Gesture Trace", desc: "Zero-velocity release check.", why: "No snapbacks on hold.", invariant: "Hold midway stays put." },
    { name: "playwright", category: "State Reality", desc: "Headless browser flows.", why: "Multi-step real browser tests.", invariant: "Flows work in real runtime." },
    { name: "recordly", category: "State Reality", desc: "Screen capture evidence.", why: "Visual proof of fixes.", invariant: "Empirical evidence over claims." },
    { name: "adb-bridge", category: "State Reality", desc: "Android logcat bridge.", why: "Native crash diagnostics.", invariant: "Device truth from logcat." },
    { name: "ocr", category: "Blast Radius", desc: "Open code review pipeline.", why: "Diff regression scan.", invariant: "Audit every diff." },
    { name: "ponytail", category: "Audit Pipeline", desc: "Diff bloat detector.", why: "Minimal diff radius.", invariant: "No drive-by refactors." },
    { name: "bugbot", category: "Audit Pipeline", desc: "Security/defect scanner.", why: "Catch secrets and flaws.", invariant: "No secrets in commits." },
    { name: "worktrunk", category: "Worktree ISO", desc: "Git worktree manager.", why: "Isolated experiments.", invariant: "Clean branch checkouts." },
    { name: "ram-tier", category: "Hardware Tier", desc: "Low-RAM sensor.", why: "Effect degradation.", invariant: "Fallbacks on weak hardware." },
    { name: "quickliquid", category: "Compositor Guard", desc: "Glass effects with fallback.", why: "Premium UI with tier guard.", invariant: "CSS fallback when GPU tight." },
    { name: "perf-fps", category: "Compositor Guard", desc: "Frame rate monitor.", why: "Catch compositor stutter.", invariant: "60 FPS scroll surfaces." },
    { name: "firecrawl", category: "Static Preflight", desc: "Doc/schema fetcher.", why: "Verified API conventions.", invariant: "No hallucinated APIs." },
    { name: "vitest-runner", category: "Static Preflight", desc: "Fast logic unit tests.", why: "Math/state only — not UI proof.", invariant: "Mocks ≠ gesture proof." },
  ];

  const COMBO_BY_NAME = Object.fromEntries(COMBOS.map((c) => [c.name, c]));
  const BB_OFFSETS = [1, 2, 4, 7];

  /** Organic scatter on a loose ring — reads circular but not a perfect circle. */
  function scatterRing(count, baseR, cx, cy, jitter, phase, squashY) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const golden = i * 2.399963229728653;
      const angle = phase + golden + Math.sin(i * 1.71) * 0.22 + Math.cos(i * 0.53) * 0.08;
      const ripple = Math.sin(i * 2.17) * jitter + Math.cos(i * 1.31) * jitter * 0.55;
      const r = baseR + ripple + (i % 5) * (jitter * 0.12);
      const sy = squashY + Math.sin(i * 0.91) * 0.04;
      pts.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle) * sy,
      });
    }
    return pts;
  }

  function placeDriversNearCombo(cx, cy, combo, drivers, outerR) {
    const baseAng = Math.atan2(combo.y - cy, combo.x - cx);
    const fan = Math.min(0.42, 0.075 * drivers.length);
    return drivers.map((d, i) => {
      const ang = baseAng + (i - (drivers.length - 1) / 2) * fan;
      const r = outerR + (i % 2) * 10 + Math.sin(i * 2.4) * 6;
      return {
        d,
        x: cx + r * Math.cos(ang),
        y: cy + r * Math.sin(ang) * 0.9,
      };
    });
  }

  function buildGraph() {
    const nodes = [];
    const edges = [];
    const byName = {};

    const width = 1280;
    const height = 1000;
    const cx = width / 2;
    const cy = height / 2 + 10;
    const innerR = 210;
    const outerR = 355;

    const innerPts = scatterRing(COMBOS.length, innerR, cx, cy, 16, 0.35, 0.92);

    COMBOS.forEach((c, j) => {
      const inboundA = DRIVERS.filter((d) => d.category === c.name).map((d) => d.name);
      const peerB = BB_OFFSETS.map((off) => COMBOS[(j + off) % COMBOS.length].name);
      const p = innerPts[j];
      const node = {
        id: c.id,
        name: c.name,
        type: "B",
        x: p.x,
        y: p.y,
        desc: c.desc,
        tier: "Layer B · Subspace Combo",
        why: c.why,
        invariant: c.invariant,
        inboundA,
        peerB,
        outboundC: CORE.map((k) => k.name),
      };
      nodes.push(node);
      byName[node.name] = node;
    });

    const driversByCombo = {};
    DRIVERS.forEach((d) => {
      const combo = COMBO_BY_NAME[d.category] || COMBOS[0];
      (driversByCombo[combo.name] ||= []).push(d);
    });

    let aIdx = 0;
    Object.entries(driversByCombo).forEach(([comboName, list]) => {
      const combo = byName[comboName];
      if (!combo) return;
      placeDriversNearCombo(cx, cy, combo, list, outerR).forEach(({ d, x, y }) => {
        aIdx += 1;
        const node = {
          id: `A${aIdx}`,
          name: d.name,
          type: "A",
          x,
          y,
          desc: d.desc,
          category: d.category,
          why: d.why,
          invariant: d.invariant,
          connectedTo: [comboName],
        };
        nodes.push(node);
        byName[node.name] = node;
        edges.push({ from: node.name, to: comboName, type: "ab" });
      });
    });

    COMBOS.forEach((_, j) => {
      BB_OFFSETS.forEach((off) => {
        edges.push({ from: COMBOS[j].name, to: COMBOS[(j + off) % COMBOS.length].name, type: "bb", offset: off });
      });
    });

    const coreOffsets = [
      { x: -42, y: -14 },
      { x: 44, y: 18 },
    ];
    CORE.forEach((c, i) => {
      const node = {
        id: c.id,
        name: c.name,
        type: "C",
        x: cx + coreOffsets[i].x,
        y: cy + coreOffsets[i].y,
        desc: c.desc,
        tier: "Core C · Autonomic Kernel",
        why: c.why,
        invariant: c.invariant,
      };
      nodes.push(node);
      byName[node.name] = node;
      COMBOS.forEach((combo) => edges.push({ from: combo.name, to: node.name, type: "bc" }));
    });

    return {
      nodes,
      edges,
      byName,
      width,
      height,
      layout: { cx, cy, outerR, innerR },
    };
  }

  global.BOB_GRAPH_DATA = { buildGraph, COMBOS, CORE, DRIVERS };
})(typeof window !== "undefined" ? window : globalThis);
