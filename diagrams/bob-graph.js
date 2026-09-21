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

  function edgePath(a, b, type) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (type === "bb") {
      const cx = (a.x + b.x) / 2 + dy * 0.22;
      const cy = (a.y + b.y) / 2 - dx * 0.22;
      return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
    }
    const c1x = a.x + dx * 0.55;
    const c1y = a.y;
    const c2x = b.x - dx * 0.55;
    const c2y = b.y;
    return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
  }

  const STROKE = {
    ab: { base: "rgba(56,189,248,0.38)", lit: "#67e8f9", w: 1 },
    bb: { base: "rgba(251,146,60,0.45)", lit: "#fdba74", w: 1.1 },
    bc: { base: "rgba(250,204,21,0.5)", lit: "#fde047", w: 1 },
  };

  function mount(opts) {
    const svg = opts.svg;
    const inspector = opts.inspector;
    const container = opts.container;
    if (!svg || !global.BOB_GRAPH_DATA) return null;

    const graph = global.BOB_GRAPH_DATA.buildGraph();
    const { nodes, edges, byName, width, height } = graph;

    let selected = null;
    let hoverName = null;
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let dragNode = null;
    let dragPointer = null;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `
      <filter id="bobGlowHot" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2.5" result="b1"/>
        <feGaussianBlur in="b1" stdDeviation="5" result="b2"/>
        <feMerge>
          <feMergeNode in="b2"/>
          <feMergeNode in="b1"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="bobBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#070b14"/>
        <stop offset="100%" stop-color="#0c1220"/>
      </linearGradient>
    `;
    svg.appendChild(defs);

    const viewport = document.createElementNS(NS, "g");
    viewport.setAttribute("id", "bobViewport");
    svg.appendChild(viewport);

    const bg = document.createElementNS(NS, "rect");
    bg.setAttribute("width", width);
    bg.setAttribute("height", height);
    bg.setAttribute("fill", "url(#bobBg)");
    viewport.appendChild(bg);

    // Column guides (not circular rings)
    [
      { x: 40, w: 280, label: "LAYER A · DRIVERS", color: "rgba(56,189,248,0.08)", stroke: "rgba(56,189,248,0.22)" },
      { x: 400, w: 440, label: "LAYER B · COMBOS (peer mesh)", color: "rgba(251,146,60,0.06)", stroke: "rgba(251,146,60,0.25)" },
      { x: 960, w: 260, label: "CORE C · KERNEL", color: "rgba(250,204,21,0.06)", stroke: "rgba(250,204,21,0.28)" },
    ].forEach((col) => {
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", col.x);
      r.setAttribute("y", 48);
      r.setAttribute("width", col.w);
      r.setAttribute("height", height - 72);
      r.setAttribute("rx", 14);
      r.setAttribute("fill", col.color);
      r.setAttribute("stroke", col.stroke);
      r.setAttribute("stroke-width", "1");
      viewport.appendChild(r);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", col.x + col.w / 2);
      t.setAttribute("y", 36);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", "#94a3b8");
      t.setAttribute("font-size", "11");
      t.setAttribute("font-weight", "700");
      t.setAttribute("letter-spacing", "0.08em");
      t.setAttribute("font-family", "system-ui,sans-serif");
      t.textContent = col.label;
      viewport.appendChild(t);
    });

    const title = document.createElementNS(NS, "text");
    title.setAttribute("x", width / 2);
    title.setAttribute("y", 22);
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("fill", "#f1f5f9");
    title.setAttribute("font-size", "15");
    title.setAttribute("font-weight", "800");
    title.setAttribute("font-family", "system-ui,sans-serif");
    title.textContent = "AUTONOMIC NETWORK ARCHITECTURE";
    viewport.appendChild(title);

    const edgesG = document.createElementNS(NS, "g");
    edgesG.setAttribute("id", "bobEdges");
    viewport.appendChild(edgesG);

    const nodesG = document.createElementNS(NS, "g");
    nodesG.setAttribute("id", "bobNodes");
    viewport.appendChild(nodesG);

    const edgeEls = edges.map((e) => {
      const path = document.createElementNS(NS, "path");
      path.dataset.from = e.from;
      path.dataset.to = e.to;
      path.dataset.type = e.type;
      if (e.offset) path.dataset.offset = String(e.offset);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      edgesG.appendChild(path);
      return { edge: e, path };
    });

    const nodeEls = new Map();

    function nodeStyle(node) {
      if (node.type === "C") return { w: 200, h: 64, fill: "#2a1f05", stroke: "#facc15", fs: 11, mono: false };
      if (node.type === "B") return { w: 168, h: 40, fill: "#3b1a0a", stroke: "#fb923c", fs: 10, mono: false };
      return { w: Math.max(node.name.length * 7.2 + 20, 88), h: 28, fill: "#082f49", stroke: "#38bdf8", fs: 9, mono: true };
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
      rect.setAttribute("rx", node.type === "C" ? 12 : 8);
      rect.setAttribute("fill", st.fill);
      rect.setAttribute("stroke", st.stroke);
      rect.setAttribute("stroke-width", node.type === "C" ? 2.2 : 1.6);

      const text = document.createElementNS(NS, "text");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("font-size", `${st.fs}px`);
      text.setAttribute("font-weight", node.type === "C" ? "800" : "600");
      text.setAttribute("font-family", st.mono ? "ui-monospace,monospace" : "system-ui,sans-serif");
      text.setAttribute("fill", node.type === "C" ? "#fef08a" : node.type === "B" ? "#ffedd5" : "#e0f2fe");
      text.textContent = node.type === "C" ? node.id : node.name;

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
        hoverName = node.name;
        applyEdgeStyles();
      });
      g.addEventListener("mouseleave", () => {
        hoverName = null;
        applyEdgeStyles();
      });

      nodesG.appendChild(g);
      nodeEls.set(node.name, { g, rect, node });
    });

    function redrawEdges() {
      edgeEls.forEach(({ edge, path }) => {
        const a = byName[edge.from];
        const b = byName[edge.to];
        if (!a || !b) return;
        path.setAttribute("d", edgePath(a, b, edge.type));
      });
    }

    function applyEdgeStyles() {
      const focus = hoverName || (selected ? selected.name : null);
      const glow = focus
        ? selected?.type === "C"
          ? "#facc15"
          : selected?.type === "B"
            ? "#fb923c"
            : "#38bdf8"
        : hoverName
          ? byName[hoverName]?.type === "C"
            ? "#facc15"
            : byName[hoverName]?.type === "B"
              ? "#fb923c"
              : "#38bdf8"
          : null;

      edgeEls.forEach(({ edge, path }) => {
        const hit = focus && (edge.from === focus || edge.to === focus);
        const spec = STROKE[edge.type];
        if (hit && glow) {
          path.setAttribute("stroke", spec.lit || glow);
          path.setAttribute("stroke-width", String(spec.w));
          path.setAttribute("opacity", "1");
          path.setAttribute("filter", "url(#bobGlowHot)");
        } else {
          path.setAttribute("stroke", spec.base);
          path.setAttribute("stroke-width", String(spec.w));
          path.setAttribute("opacity", focus ? "0.3" : "0.7");
          path.removeAttribute("filter");
        }
      });

      nodeEls.forEach(({ rect, node }, name) => {
        const on = focus === name;
        rect.setAttribute("stroke-width", on ? "3" : node.type === "C" ? "2.2" : "1.6");
        rect.setAttribute("stroke-dasharray", on ? "4 2" : "none");
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

      let links = "";
      if (node.type === "A" && node.connectedTo) {
        links = `<div style="margin-top:12px"><div style="font-size:10px;font-weight:700;color:#94a3b8;margin-bottom:6px">FEEDS →</div>${node.connectedTo.map((n) => `<button type="button" class="bob-pill" data-t="${esc(n)}">${esc(n)}</button>`).join(" ")}</div>`;
      } else if (node.type === "B") {
        links = `
          <div style="margin-top:12px;font-size:10px;font-weight:700;color:#94a3b8">PEER MESH (B↔B)</div>
          <div style="margin:6px 0 10px">${(node.peerB || []).map((n) => `<button type="button" class="bob-pill" data-t="${esc(n)}">${esc(n)}</button>`).join(" ")}</div>
          <div style="font-size:10px;font-weight:700;color:#94a3b8">STREAMS → CORE</div>
          <div style="margin-top:6px">${(node.outboundC || []).map((n) => `<button type="button" class="bob-pill bob-pill-gold" data-t="${esc(n)}">${esc(n)}</button>`).join(" ")}</div>`;
      } else if (node.type === "C") {
        links = `<div style="margin-top:12px;font-size:10px;font-weight:700;color:#94a3b8">SUPERVISES 15 COMBOS</div><p style="font-size:12px;color:#cbd5e1;margin:8px 0 0">All Layer B combos stream invariant telemetry into this kernel.</p>`;
      }

      inspector.innerHTML = `
        <div style="margin-bottom:10px"><span style="background:${badge};color:#000;font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px">${esc(tier)}</span></div>
        <h4 style="margin:0 0 8px;font-size:18px;color:#f8fafc">${esc(node.name)}</h4>
        <p style="margin:0 0 12px;font-size:13px;line-height:1.55;color:#cbd5e1">${esc(node.desc)}</p>
        <div style="background:rgba(15,23,42,0.7);border:1px solid rgba(56,189,248,0.2);border-radius:8px;padding:12px;margin-bottom:10px">
          <div style="font-size:10px;font-weight:700;color:#fbbf24;margin-bottom:6px">WHY CONNECTED</div>
          <div style="font-size:12px;line-height:1.55;color:#e2e8f0">${esc(node.why)}</div>
        </div>
        <div style="background:rgba(15,23,42,0.7);border:1px solid rgba(168,85,247,0.25);border-radius:8px;padding:12px;margin-bottom:10px">
          <div style="font-size:10px;font-weight:700;color:#c4b5fd;margin-bottom:6px">INVARIANT</div>
          <div style="font-size:12px;color:#e2e8f0;font-style:italic">"${esc(node.invariant)}"</div>
        </div>
        ${links}
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
      viewport.setAttribute("transform", `translate(${panX},${panY}) scale(${scale})`);
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
        "position:absolute;top:10px;right:10px;display:flex;gap:6px;align-items:center;background:rgba(15,23,42,0.92);border:1px solid rgba(148,163,184,0.25);border-radius:8px;padding:4px 8px;z-index:5";
      toolbar.querySelectorAll("button").forEach((btn) => {
        btn.style.cssText =
          "width:28px;height:28px;border:1px solid rgba(148,163,184,0.3);background:#0f172a;color:#e2e8f0;border-radius:6px;cursor:pointer;font-size:16px;line-height:1";
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
        "position:absolute;bottom:10px;left:12px;font-size:10px;color:rgba(148,163,184,0.75);pointer-events:none";
      hint.textContent = "Drag boxes · Ctrl+scroll zoom · Hover = thin tubelight trace · Orange = B↔B mesh";
      container.appendChild(hint);
    }

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
      if (ev.target === svg || ev.target === bg) clearSelection();
    });

    redrawEdges();
    applyViewport();
    clearSelection();

    return { graph, selectNode, clearSelection, zoomAt };
  }

  global.BobGraph = { mount };
})(typeof window !== "undefined" ? window : globalThis);
