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
  /** Ring neighbor + one cross-chord — enough mesh without hairball. */
  const BB_OFFSETS = [1, 4];

  function nodeDims(node) {
    if (node.type === "C") {
      const w = Math.min(Math.max(node.name.length * 4.6 + 16, 108), 148);
      return { w, h: 22 };
    }
    if (node.type === "B") return { w: 88, h: 20 };
    return { w: Math.max(node.name.length * 5.2 + 12, 54), h: 16 };
  }

  function rectsOverlap(a, b, pad = 6) {
    const da = nodeDims(a);
    const db = nodeDims(b);
    return (
      Math.abs(a.x - b.x) < (da.w + db.w) / 2 + pad &&
      Math.abs(a.y - b.y) < (da.h + db.h) / 2 + pad
    );
  }

  /** Spread nodes on Y so boxes never stack on the same row. */
  function spreadByY(pts, minGap, anchorY) {
    if (!pts.length) return pts;
    const sorted = [...pts].sort((p, q) => p.y - q.y);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].y - sorted[i - 1].y < minGap) sorted[i].y = sorted[i - 1].y + minGap;
    }
    const mid = (sorted[0].y + sorted[sorted.length - 1].y) / 2;
    const shift = anchorY - mid;
    sorted.forEach((p) => {
      p.y += shift;
    });
    return sorted;
  }

  /** Push apart any remaining overlaps (keeps tier, nudges along X/Y). */
  function resolveOverlaps(nodes, maxIter = 80) {
    for (let iter = 0; iter < maxIter; iter++) {
      let moved = false;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          if (!rectsOverlap(a, b, 4)) continue;
          const da = nodeDims(a);
          const db = nodeDims(b);
          const dx = b.x - a.x || 0.01;
          const dy = b.y - a.y || 0.01;
          const dist = Math.hypot(dx, dy) || 1;
          const needX = (da.w + db.w) / 2 + 8 - Math.abs(dx);
          const needY = (da.h + db.h) / 2 + 8 - Math.abs(dy);
          const push = Math.max(needX, needY, 4);
          const px = (dx / dist) * push * 0.5;
          const py = (dy / dist) * push * 0.5;
          a.x -= px;
          a.y -= py;
          b.x += px;
          b.y += py;
          moved = true;
        }
      }
      if (!moved) break;
    }
  }

  /**
   * Parenthesis arc: `(` on left or `)` on right — bulges outward, opens toward center.
   * Combos alternate in/out (back-forth) along the arc.
   */
  function parenArc(count, cx, cy, anchor, bulge, span, side, stagger = 34) {
    const pts = [];
    const left = side === "left";
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = -Math.PI / 2 + t * Math.PI;
      const bow = bulge * (1 + Math.cos(angle)) / 2;
      const depth = i % 2 === 0 ? 0 : stagger;
      const x = (left ? cx - anchor - bow + depth : cx + anchor + bow - depth);
      const y = cy + (span * Math.sin(angle)) / 2;
      pts.push({ x, y, t, side, idx: i });
    }
    return pts;
  }

  /** One driver per arc slot on the outer paren — zigzag in/out so boxes never stack. */
  function placeDriversOnOuterArc(entries, cx, cy, anchor, bulge, span, side) {
    const slots = parenArc(entries.length, cx, cy, anchor, bulge, span, side, 22);
    return entries.map((entry, i) => {
      const zig = i % 2 === 0 ? 0 : side === "left" ? 18 : -18;
      return {
        ...entry,
        x: slots[i].x + zig,
        y: slots[i].y,
        side,
      };
    });
  }

  function buildGraph() {
    const nodes = [];
    const edges = [];
    const byName = {};

    const width = 1520;
    const height = 760;
    const cx = width / 2;
    const cy = height / 2;
    const leftComboCount = 8;
    const comboGap = 24;
    const innerAnchor = 68;
    const innerBulge = 108;
    const innerSpan = 440;
    const leftInner = spreadByY(
      parenArc(leftComboCount, cx, cy, innerAnchor, innerBulge, innerSpan, "left", 22),
      comboGap,
      cy
    );
    const rightInner = spreadByY(
      parenArc(COMBOS.length - leftComboCount, cx, cy, innerAnchor, innerBulge, innerSpan, "right", 22),
      comboGap,
      cy
    );
    const comboPts = [...leftInner, ...rightInner];

    COMBOS.forEach((c, j) => {
      const inboundA = DRIVERS.filter((d) => d.category === c.name).map((d) => d.name);
      const peerB = BB_OFFSETS.map((off) => COMBOS[(j + off) % COMBOS.length].name);
      const coreTarget = CORE[j % 2].name;
      const p = comboPts[j];
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
        outboundC: [coreTarget],
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
    const driverEntries = [];
    DRIVERS.forEach((d) => {
      const combo = COMBO_BY_NAME[d.category] || COMBOS[0];
      const comboNode = byName[combo.name];
      if (!comboNode) return;
      driverEntries.push({
        d,
        comboName: combo.name,
        side: comboNode.x < cx ? "left" : "right",
        comboY: comboNode.y,
      });
    });
    const bySide = (side) =>
      driverEntries
        .filter((e) => e.side === side)
        .sort((a, b) => a.comboY - b.comboY || a.d.name.localeCompare(b.d.name));
    const outerAnchor = 44;
    const outerBulge = 200;
    const outerSpan = 500;
    const leftDrivers = spreadByY(
      placeDriversOnOuterArc(bySide("left"), cx, cy, outerAnchor, outerBulge, outerSpan, "left"),
      18,
      cy
    );
    const rightDrivers = spreadByY(
      placeDriversOnOuterArc(bySide("right"), cx, cy, outerAnchor, outerBulge, outerSpan, "right"),
      18,
      cy
    );
    [...leftDrivers, ...rightDrivers].forEach(({ d, x, y, comboName }) => {
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

    COMBOS.forEach((_, j) => {
      BB_OFFSETS.forEach((off) => {
        edges.push({ from: COMBOS[j].name, to: COMBOS[(j + off) % COMBOS.length].name, type: "bb", offset: off });
      });
    });

    CORE.forEach((c, i) => {
      const node = {
        id: c.id,
        name: c.name,
        type: "C",
        x: cx + (i % 2 === 0 ? -6 : 6),
        y: cy + (i === 0 ? -34 : 34),
        desc: c.desc,
        tier: "Core C · Autonomic Kernel",
        why: c.why,
        invariant: c.invariant,
      };
      nodes.push(node);
      byName[node.name] = node;
    });

    COMBOS.forEach((combo, j) => {
      edges.push({ from: combo.name, to: CORE[j % 2].name, type: "bc" });
    });

    resolveOverlaps(nodes);

    return {
      nodes,
      edges,
      byName,
      width,
      height,
      layout: {
        cx,
        cy,
        paren: {
          leftOuter: { anchor: outerAnchor, bulge: outerBulge, span: outerSpan },
          leftInner: { anchor: innerAnchor, bulge: innerBulge, span: innerSpan },
          rightInner: { anchor: innerAnchor, bulge: innerBulge, span: innerSpan },
          rightOuter: { anchor: outerAnchor, bulge: outerBulge, span: outerSpan },
        },
      },
    };
  }

  global.BOB_GRAPH_DATA = { buildGraph, nodeDims, COMBOS, CORE, DRIVERS };
})(typeof window !== "undefined" ? window : globalThis);
