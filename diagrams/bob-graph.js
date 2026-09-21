/**
 * Bob interactive architecture graph — column layout, draggable nodes, pan/zoom.
 * Edges render behind nodes and re-route when boxes move.
 */
(function (global) {
  const NS = "http://www.w3.org/2000/svg";

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dimsFor(node) {
    if (global.BOB_GRAPH_DATA?.nodeDims) return global.BOB_GRAPH_DATA.nodeDims(node);
    if (node.type === "C") return { w: 120, h: 22 };
    if (node.type === "B") return { w: 88, h: 20 };
    return { w: Math.max(node.name.length * 5.2 + 12, 54), h: 16 };
  }

  /** Edge attach point on box perimeter facing the other node. */
  function boxAnchor(node, towardX, towardY) {
    const { w, h } = dimsFor(node);
    const dx = towardX - node.x;
    const dy = towardY - node.y;
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: node.x, y: node.y };
    const sx = dx !== 0 ? (w / 2) / Math.abs(dx) : Infinity;
    const sy = dy !== 0 ? (h / 2) / Math.abs(dy) : Infinity;
    const t = Math.min(sx, sy);
    return { x: node.x + dx * t, y: node.y + dy * t };
  }

  function edgePath(a, b, type) {
    const from = boxAnchor(a, b.x, b.y);
    const to = boxAnchor(b, a.x, a.y);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const len = Math.hypot(dx, dy) || 1;

    if (type === "bb") {
      const bow = Math.min(len * 0.2, 42);
      const cpx = mx + (dy / len) * bow;
      const cpy = my - (dx / len) * bow;
      return `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`;
    }

    const pull = Math.min(Math.abs(dx) * 0.44, 64);
    const dir = dx >= 0 ? 1 : -1;
    const c1x = from.x + dir * pull;
    const c1y = from.y + dy * 0.12;
    const c2x = to.x - dir * pull;
    const c2y = to.y - dy * 0.12;
    return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
  }

  const STROKE = {
    ab: { base: "#4a6278", lit: "#8aa4b8", w: 1 },
    bb: { base: "#5a4840", lit: "#907060", w: 1 },
    bc: { base: "#5a5440", lit: "#908860", w: 0.9 },
  };

  const GLOW_STROKE = { A: "#6a9ab8", B: "#b08068", C: "#c4b060" };

  function mount(opts) {
    const svg = opts.svg;
    const inspector = opts.inspector;
    const container = opts.container;
    if (!svg || !global.BOB_GRAPH_DATA) return null;

    const graph = global.BOB_GRAPH_DATA.buildGraph();
    const { nodes, edges, byName, width, height, layout } = graph;
    const hub = layout || { cx: width / 2, cy: height / 2 };

    let selected = null;
    let hoverName = null;
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let dragNode = null;
    let dragPointer = null;
    let panPointer = null;
    let panMoved = false;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = ``;
    svg.appendChild(defs);

    const chartG = document.createElementNS(NS, "g");
    chartG.setAttribute("id", "bobChart");
    svg.appendChild(chartG);

    const bg = document.createElementNS(NS, "rect");
    bg.setAttribute("width", width);
    bg.setAttribute("height", height);
    bg.setAttribute("fill", "#000000");
    chartG.appendChild(bg);

    const edgesG = document.createElementNS(NS, "g");
    edgesG.setAttribute("id", "bobEdges");
    chartG.appendChild(edgesG);

    const nodesG = document.createElementNS(NS, "g");
    nodesG.setAttribute("id", "bobNodes");
    chartG.appendChild(nodesG);

    const edgeEls = edges.map((e) => {
      const path = document.createElementNS(NS, "path");
      path.dataset.from = e.from;
      path.dataset.to = e.to;
      path.dataset.type = e.type;
      if (e.offset) path.dataset.offset = String(e.offset);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      edgesG.appendChild(path);
      return { edge: e, path };
    });

    const nodeEls = new Map();

    function nodeStyle(node) {
      const d = dimsFor(node);
      if (node.type === "C") {
        return { w: d.w, h: d.h, fill: "#222018", stroke: "#6a6040", fs: 5.8, mono: false, sw: 0.9, text: "#c4b890" };
      }
      if (node.type === "B") {
        return { w: d.w, h: d.h, fill: "#241e1a", stroke: "#6a5448", fs: 7, mono: false, sw: 0.9, text: "#c8b8a8" };
      }
      return {
        w: d.w,
        h: d.h,
        fill: "#1c2630",
        stroke: "#4a6278",
        fs: 6.5,
        mono: true,
        sw: 0.85,
        text: "#a8bcc8",
      };
    }

    nodes.forEach((node) => {
      const g = document.createElementNS(NS, "g");
      g.dataset.nodename = node.name;
      g.style.cursor = "grab";

      const st = nodeStyle(node);
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", -st.w / 2);
      rect.setAttribute("y", -st.h / 2);
      rect.setAttribute("width", st.w);
      rect.setAttribute("height", st.h);
      rect.setAttribute("rx", node.type === "C" ? 7 : 5);
      rect.setAttribute("fill", st.fill);
      rect.setAttribute("stroke", st.stroke);
      rect.setAttribute("stroke-width", String(st.sw));

      const text = document.createElementNS(NS, "text");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("font-size", `${st.fs}px`);
      text.setAttribute("font-weight", "500");
      text.setAttribute("font-family", st.mono ? "ui-monospace,monospace" : "system-ui,sans-serif");
      text.setAttribute("fill", st.text);
      text.textContent = node.name;

      g.appendChild(rect);
      g.appendChild(text);
      g.setAttribute("transform", `translate(${node.x},${node.y})`);

      g.addEventListener("pointerdown", (ev) => {
        ev.stopPropagation();
        dragNode = node;
        dragPointer = { id: ev.pointerId, ox: ev.clientX, oy: ev.clientY, nx: node.x, ny: node.y };
        g.setPointerCapture(ev.pointerId);
        g.style.cursor = "grabbing";
      });
      g.addEventListener("pointermove", (ev) => {
        if (!dragNode || dragNode !== node || !dragPointer || dragPointer.id !== ev.pointerId) return;
        const dx = (ev.clientX - dragPointer.ox) / scale;
        const dy = (ev.clientY - dragPointer.oy) / scale;
        node.x = dragPointer.nx + dx;
        node.y = dragPointer.ny + dy;
        if (node.type === "C") node.x = hub.cx;
        g.setAttribute("transform", `translate(${node.x},${node.y})`);
        redrawEdges();
      });
      g.addEventListener("pointerup", (ev) => {
        if (dragNode === node) {
          dragNode = null;
          dragPointer = null;
          g.style.cursor = "grab";
        }
      });
      g.addEventListener("click", (ev) => {
        ev.stopPropagation();
        selectNode(node);
      });
      g.addEventListener("mouseenter", () => {
        if (!selected) {
          hoverName = node.name;
          applyEdgeStyles();
        }
      });
      g.addEventListener("mouseleave", () => {
        if (!selected) {
          hoverName = null;
          applyEdgeStyles();
        }
      });

      nodesG.appendChild(g);
      nodeEls.set(node.name, { g, rect, text, node });
    });

    function directNeighbors(name) {
      const set = new Set([name]);
      edges.forEach((e) => {
        if (e.from === name) set.add(e.to);
        if (e.to === name) set.add(e.from);
      });
      return set;
    }

    function redrawEdges() {
      edgeEls.forEach(({ edge, path }) => {
        const a = byName[edge.from];
        const b = byName[edge.to];
        if (!a || !b) return;
        path.setAttribute("d", edgePath(a, b, edge.type));
      });
    }

    function applyEdgeStyles() {
      const focus = selected ? selected.name : hoverName;
      const litSet = focus ? directNeighbors(focus) : null;
      const focusType = focus ? byName[focus]?.type : null;
      const clicked = Boolean(selected);

      edgeEls.forEach(({ edge, path }) => {
        const hit = focus && (edge.from === focus || edge.to === focus);
        const spec = STROKE[edge.type];

        if (edge.type === "bb") {
          const showMesh = focusType === "B" && hit;
          path.setAttribute("stroke", showMesh ? spec.lit : spec.base);
          path.setAttribute("stroke-width", String(spec.w));
          path.setAttribute("opacity", showMesh ? (clicked ? "0.95" : "1") : "0");
          return;
        }

        if (hit) {
          path.setAttribute("stroke", spec.lit);
          path.setAttribute("stroke-width", clicked ? "1.1" : String(spec.w));
          path.setAttribute("opacity", clicked ? "0.95" : "1");
        } else {
          path.setAttribute("stroke", spec.base);
          path.setAttribute("stroke-width", String(spec.w));
          path.setAttribute("opacity", focus ? (clicked ? "0.18" : "0.45") : "0.75");
        }
      });

      nodeEls.forEach(({ rect, text, node }, name) => {
        const st = nodeStyle(node);
        const isFocus = focus === name;
        const isNeighbor = litSet && litSet.has(name) && !isFocus;

        if (!focus) {
          rect.setAttribute("fill", st.fill);
          rect.setAttribute("stroke", st.stroke);
          rect.setAttribute("stroke-width", String(st.sw));
          rect.setAttribute("opacity", "1");
          text.setAttribute("fill", st.text);
          text.setAttribute("opacity", "1");
          return;
        }

        if (isFocus) {
          rect.setAttribute("fill", st.fill);
          rect.setAttribute("stroke", GLOW_STROKE[node.type]);
          rect.setAttribute("stroke-width", clicked ? "1.5" : "1.3");
          rect.setAttribute("opacity", "1");
          text.setAttribute("fill", st.text);
          text.setAttribute("opacity", "1");
        } else if (isNeighbor) {
          rect.setAttribute("fill", st.fill);
          rect.setAttribute("stroke", GLOW_STROKE[node.type]);
          rect.setAttribute("stroke-width", "1.1");
          rect.setAttribute("opacity", clicked ? "0.82" : "0.9");
          text.setAttribute("fill", st.text);
          text.setAttribute("opacity", clicked ? "0.82" : "0.9");
        } else {
          rect.setAttribute("fill", st.fill);
          rect.setAttribute("stroke", st.stroke);
          rect.setAttribute("stroke-width", String(st.sw));
          rect.setAttribute("opacity", clicked ? "0.22" : "0.45");
          text.setAttribute("fill", st.text);
          text.setAttribute("opacity", clicked ? "0.22" : "0.45");
        }
      });
    }

    function selectNode(node) {
      selected = node;
      applyEdgeStyles();
      renderInspector(node);
    }

    function clearSelection() {
      selected = null;
      applyEdgeStyles();
      if (inspector) {
        inspector.innerHTML = `<p style="color:#94a3b8;font-size:13px;margin:0">Click any box to inspect wiring, invariants, and peer links. Drag boxes to rearrange; connectors follow.</p>`;
      }
    }

    function renderInspectorDetails(node) {
      const p = (html) => `<p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#cbd5e1">${html}</p>`;
      const sub = (title, html) =>
        `<div style="margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#8a949e;margin-bottom:5px;letter-spacing:0.04em">${title}</div>${html}</div>`;

      if (node.type === "A") {
        const combo = node.connectedTo?.[0] || node.category || "—";
        const siblings = edges
          .filter((e) => e.type === "ab" && e.to === combo && e.from !== node.name)
          .map((e) => e.from);
        return `
          ${sub("ROLE", p(`<strong style="color:#e2e8f0">Layer A raw driver.</strong> <code style="color:#8ab4c8">${esc(node.name)}</code> feeds the <strong style="color:#e8c4b0">${esc(combo)}</strong> subspace combo on the outer tier.`))}
          ${sub("FUNCTION", p(esc(node.desc)))}
          ${sub(
            "INTEGRATION",
            p(
              `${esc(node.why)} It sits in the <strong style="color:#e2e8f0">${esc(node.category)}</strong> driver cluster alongside ${siblings.length ? esc(siblings.join(", ")) : "peer drivers in the same category"}.`
            )
          )}
          ${sub("INVARIANT", p(`<em style="color:#e2e8f0">"${esc(node.invariant)}"</em> — enforced before any downstream combo logic runs.`))}
        `;
      }

      if (node.type === "B") {
        const drivers = node.inboundA || [];
        const peers = node.peerB || [];
        const cores = node.outboundC || [];
        return `
          ${sub("ROLE", p(`<strong style="color:#e2e8f0">Layer B subspace combo</strong> <code style="color:#c8b8a8">${esc(node.id || "")}</code> — aggregates ${drivers.length} Layer A driver${drivers.length === 1 ? "" : "s"} into a single autonomic subspace.`))}
          ${sub("FUNCTION", p(esc(node.desc)))}
          ${sub(
            "DRIVER FEEDS (A→B)",
            p(
              drivers.length
                ? `Inbound drivers: <strong style="color:#a8c4d8">${esc(drivers.join(", "))}</strong>. Each streams capability into this combo before any B↔B mesh or B→C kernel traffic.`
                : "No dedicated drivers — combo operates from mesh and kernel links only."
            )
          )}
          ${sub(
            "PEER MESH (B↔B)",
            p(
              `Mesh peers: <strong style="color:#e8c4b0">${esc(peers.join(", "))}</strong>. ${esc(node.why)} Cross-combo links keep blast radius, audit, and causal traces coherent across subspaces.`
            )
          )}
          ${sub(
            "KERNEL STREAM (B→C)",
            p(`Streams invariant telemetry to <strong style="color:#e8d890">${esc(cores.join(", "))}</strong> at the core. The kernel uses this stream for pass/fail gating and forensic routing.`)
          )}
          ${sub("INVARIANT", p(`<em style="color:#e2e8f0">"${esc(node.invariant)}"</em> — violation halts the pipeline; acceptance-review is the sole Pass authority.`))}
        `;
      }

      const inboundCombos = edges
        .filter((e) => e.type === "bc" && e.to === node.name)
        .map((e) => e.from)
        .sort();
      const driverCount = inboundCombos.reduce((n, c) => n + (byName[c]?.inboundA?.length || 0), 0);
      return `
        ${sub("ROLE", p(`<strong style="color:#e2e8f0">Core C autonomic kernel.</strong> ${esc(node.name)} is one of two center kernels — the ${node.id === "C1" ? "contract and loss gate" : "forensic and causal routing"} authority for the entire network.`))}
        ${sub("FUNCTION", p(esc(node.desc)))}
        ${sub(
          "INBOUND COMBOS (B→C)",
          p(
            `${inboundCombos.length} combos stream here: <strong style="color:#e8c4b0">${esc(inboundCombos.join(", "))}</strong>. Together they cover ${driverCount} Layer A drivers across the outer tier.`
          )
        )}
        ${sub(
          "ROUTING & AUTHORITY",
          p(
            `${esc(node.why)} When this kernel receives a failed invariant or broken checklist item, it blocks merge and routes forensic orders to Surgical Fixer (B15) via the causal mesh.`
          )
        )}
        ${sub("INVARIANT", p(`<em style="color:#e2e8f0">"${esc(node.invariant)}"</em> — this is non-negotiable pipeline law; no combo or driver may override it.`))}
      `;
    }

    function renderInspector(node) {
      if (!inspector) return;
      const tier =
        node.type === "C"
          ? "Core C · Autonomic Kernel"
          : node.type === "B"
            ? "Layer B · Subspace Combo"
            : "Layer A · Raw Driver";
      const badge =
        node.type === "C" ? "#facc15" : node.type === "B" ? "#fb923c" : "#38bdf8";

      const wiring = directNeighbors(node.name);
      const wiringPills = [...wiring]
        .filter((n) => n !== node.name)
        .map(
          (n) =>
            `<button type="button" class="bob-pill${byName[n]?.type === "C" ? " bob-pill-gold" : ""}" data-t="${esc(n)}">${esc(n)}</button>`
        )
        .join(" ");

      inspector.innerHTML = `
        <div style="margin-bottom:10px"><span style="background:${badge};color:#000;font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px">${esc(tier)}</span></div>
        <h4 style="margin:0 0 12px;font-size:18px;color:#f8fafc">${esc(node.name)}</h4>
        <div style="background:#000;border:1px solid #1a1a1a;border-radius:4px;padding:14px;margin-bottom:12px">
          <div style="font-size:10px;font-weight:800;color:#94a3b8;margin-bottom:12px;letter-spacing:0.12em">DETAILS</div>
          ${renderInspectorDetails(node)}
        </div>
        <div style="margin-top:4px">
          <div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:8px;letter-spacing:0.06em">CONNECTED</div>
          <div>${wiringPills || '<span style="color:#64748b;font-size:12px">None</span>'}</div>
        </div>
      `;
      inspector.querySelectorAll(".bob-pill").forEach((btn) => {
        btn.style.cssText =
          "display:inline-block;margin:2px;padding:4px 8px;border-radius:6px;border:1px solid rgba(251,146,60,0.4);background:rgba(251,146,60,0.12);color:#ffedd5;font-size:11px;cursor:pointer";
        if (btn.classList.contains("bob-pill-gold")) {
          btn.style.borderColor = "rgba(250,204,21,0.45)";
          btn.style.background = "rgba(250,204,21,0.12)";
          btn.style.color = "#fef08a";
        }
        btn.addEventListener("click", () => {
          const t = byName[btn.dataset.t];
          if (t) selectNode(t);
        });
      });
    }

    function applyViewport() {
      chartG.setAttribute("transform", `translate(${panX},${panY}) scale(${scale})`);
    }

    function zoomAt(factor, clientX, clientY) {
      const rect = svg.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const prev = scale;
      const next = Math.min(2.5, Math.max(0.35, scale * factor));
      const ratio = next / prev;
      panX = sx - ratio * (sx - panX);
      panY = sy - ratio * (sy - panY);
      scale = next;
      applyViewport();
      updateZoomLabel();
    }

    let zoomLabel = null;
    function updateZoomLabel() {
      if (zoomLabel) zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    }

    if (container) {
      const toolbar = document.createElement("div");
      toolbar.className = "bob-graph-toolbar";
      toolbar.innerHTML = `
        <button type="button" data-zoom="out" title="Zoom out">−</button>
        <span data-zoom-label>100%</span>
        <button type="button" data-zoom="in" title="Zoom in">+</button>
        <button type="button" data-zoom="reset" title="Reset view">Reset</button>
      `;
      toolbar.style.cssText =
        "position:absolute;top:10px;right:10px;display:flex;gap:6px;align-items:center;background:#000;border:1px solid #1a1a1a;border-radius:6px;padding:4px 8px;z-index:5";
      toolbar.querySelectorAll("button").forEach((btn) => {
        btn.style.cssText =
          "width:28px;height:28px;border:1px solid #1a1a1a;background:#000;color:#b0b8c0;border-radius:4px;cursor:pointer;font-size:16px;line-height:1";
        btn.addEventListener("click", () => {
          const r = svg.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          if (btn.dataset.zoom === "in") zoomAt(1.15, cx, cy);
          else if (btn.dataset.zoom === "out") zoomAt(1 / 1.15, cx, cy);
          else {
            scale = 1;
            panX = 0;
            panY = 0;
            applyViewport();
            updateZoomLabel();
          }
        });
      });
      zoomLabel = toolbar.querySelector("[data-zoom-label]");
      zoomLabel.style.cssText = "font-size:11px;font-family:monospace;color:#94a3b8;min-width:42px;text-align:center";
      container.style.position = "relative";
      container.appendChild(toolbar);

      const hint = document.createElement("div");
      hint.style.cssText =
        "position:absolute;bottom:10px;left:12px;font-size:10px;color:#4a525a;pointer-events:none";
      hint.textContent = "Drag background to pan · Drag boxes to move · Ctrl+scroll zoom";
      container.appendChild(hint);
    }

    function isPanTarget(target) {
      return target === svg || target === bg || target.parentElement === edgesG;
    }

    svg.addEventListener("pointerdown", (ev) => {
      if (dragNode || !isPanTarget(ev.target)) return;
      panMoved = false;
      panPointer = {
        id: ev.pointerId,
        ox: ev.clientX,
        oy: ev.clientY,
        px: panX,
        py: panY,
      };
      svg.setPointerCapture(ev.pointerId);
      svg.style.cursor = "grabbing";
    });

    svg.addEventListener("pointermove", (ev) => {
      if (!panPointer || panPointer.id !== ev.pointerId) return;
      const dx = ev.clientX - panPointer.ox;
      const dy = ev.clientY - panPointer.oy;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) panMoved = true;
      panX = panPointer.px + dx;
      panY = panPointer.py + dy;
      applyViewport();
    });

    svg.addEventListener("pointerup", (ev) => {
      if (!panPointer || panPointer.id !== ev.pointerId) return;
      panPointer = null;
      svg.style.cursor = "";
      try {
        svg.releasePointerCapture(ev.pointerId);
      } catch (_) {
        /* already released */
      }
    });

    svg.addEventListener(
      "wheel",
      (ev) => {
        if (!ev.ctrlKey && !ev.metaKey) return;
        ev.preventDefault();
        zoomAt(ev.deltaY < 0 ? 1.08 : 1 / 1.08, ev.clientX, ev.clientY);
      },
      { passive: false }
    );

    svg.addEventListener("click", (ev) => {
      if (panMoved) return;
      if (isPanTarget(ev.target)) clearSelection();
    });

    redrawEdges();
    applyViewport();
    clearSelection();

    return { graph, selectNode, clearSelection, zoomAt };
  }

  global.BobGraph = { mount };
})(typeof window !== "undefined" ? window : globalThis);
