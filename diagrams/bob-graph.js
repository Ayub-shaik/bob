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

  function edgePath(a, b, type, hub) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;

    if (type === "bb") {
      const cx = mx + dy * 0.18;
      const cy = my - dx * 0.18;
      return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
    }

    if (type === "ab") {
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    }

    if (hub) {
      const hx = hub.cx;
      const hy = hub.cy;
      const vx = mx - hx;
      const vy = my - hy;
      const dist = Math.hypot(vx, vy) || 1;
      const pull = 28;
      const cpx = mx - (vx / dist) * pull;
      const cpy = my - (vy / dist) * pull;
      return `M ${a.x} ${a.y} Q ${cpx} ${cpy} ${b.x} ${b.y}`;
    }

    const c1x = a.x + dx * 0.5;
    const c1y = a.y + dy * 0.1;
    const c2x = b.x - dx * 0.5;
    const c2y = b.y - dy * 0.1;
    return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
  }

  const STROKE = {
    ab: { base: "#4a6278", lit: "#8aa4b8", w: 1 },
    bb: { base: "#5a4840", lit: "#907060", w: 1 },
    bc: { base: "#5a5440", lit: "#908860", w: 0.9 },
  };

  function mount(opts) {
    const svg = opts.svg;
    const inspector = opts.inspector;
    const container = opts.container;
    if (!svg || !global.BOB_GRAPH_DATA) return null;

    const graph = global.BOB_GRAPH_DATA.buildGraph();
    const { nodes, edges, byName, width, height, layout } = graph;
    const hub = layout || { cx: width / 2, cy: height / 2, outerR: 430, innerR: 228 };

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
    defs.innerHTML = ``;
    svg.appendChild(defs);

    const viewport = document.createElementNS(NS, "g");
    viewport.setAttribute("id", "bobViewport");
    svg.appendChild(viewport);

    const bg = document.createElementNS(NS, "rect");
    bg.setAttribute("width", width);
    bg.setAttribute("height", height);
    bg.setAttribute("fill", "#000000");
    viewport.appendChild(bg);

    // Loose tier guides — suggest outer / inner / center without a rigid circle
    const zonesG = document.createElementNS(NS, "g");
    zonesG.setAttribute("opacity", "0.55");
    [
      { rx: hub.outerR + 28, ry: (hub.outerR + 28) * 0.86, stroke: "#3d4f63", dash: "5 9", label: "OUTER · DRIVERS", ly: hub.cy - hub.outerR - 48 },
      { rx: hub.innerR + 18, ry: (hub.innerR + 18) * 0.9, stroke: "#4a4038", dash: "4 7", label: "INNER · COMBOS", ly: hub.cy - hub.innerR - 16 },
      { rx: 56, ry: 44, stroke: "#454018", dash: "3 5", label: "CENTER · KERNEL", ly: hub.cy - 48 },
    ].forEach((z) => {
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("cx", hub.cx);
      e.setAttribute("cy", hub.cy);
      e.setAttribute("rx", z.rx);
      e.setAttribute("ry", z.ry);
      e.setAttribute("fill", "none");
      e.setAttribute("stroke", z.stroke);
      e.setAttribute("stroke-width", "1");
      e.setAttribute("stroke-dasharray", z.dash);
      zonesG.appendChild(e);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", hub.cx);
      t.setAttribute("y", z.ly);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", "#6b7c8f");
      t.setAttribute("font-size", "10");
      t.setAttribute("font-weight", "700");
      t.setAttribute("letter-spacing", "0.1em");
      t.setAttribute("font-family", "system-ui,sans-serif");
      t.textContent = z.label;
      zonesG.appendChild(t);
    });
    viewport.appendChild(zonesG);

    const title = document.createElementNS(NS, "text");
    title.setAttribute("x", width / 2);
    title.setAttribute("y", 22);
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("fill", "#e8edf2");
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
      if (node.type === "C") {
        return { w: 24, h: 13, fill: "#222018", stroke: "#6a6040", fs: 6, mono: true, sw: 0.8, text: "#c4b890" };
      }
      if (node.type === "B") {
        return { w: 88, h: 20, fill: "#241e1a", stroke: "#6a5448", fs: 7, mono: false, sw: 0.9, text: "#c8b8a8" };
      }
      return {
        w: Math.max(node.name.length * 5.2 + 12, 54),
        h: 16,
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
        path.setAttribute("d", edgePath(a, b, edge.type, hub));
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
          path.setAttribute("stroke", spec.lit);
          path.setAttribute("stroke-width", String(spec.w));
          path.setAttribute("opacity", "1");
        } else {
          path.setAttribute("stroke", spec.base);
          path.setAttribute("stroke-width", String(spec.w));
          path.setAttribute("opacity", focus ? "0.55" : "0.9");
        }
      });

      nodeEls.forEach(({ rect, node }, name) => {
        const on = focus === name;
        rect.setAttribute("stroke-width", on ? "1.8" : String(nodeStyle(node).sw));
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
        <div style="background:#000;border:1px solid #1a1a1a;border-radius:4px;padding:12px;margin-bottom:10px">
          <div style="font-size:10px;font-weight:700;color:#8a7860;margin-bottom:6px">WHY CONNECTED</div>
          <div style="font-size:12px;line-height:1.55;color:#b0b8c0">${esc(node.why)}</div>
        </div>
        <div style="background:#000;border:1px solid #1a1a1a;border-radius:4px;padding:12px;margin-bottom:10px">
          <div style="font-size:10px;font-weight:700;color:#707880;margin-bottom:6px">INVARIANT</div>
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
