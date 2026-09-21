# Cursor session handoff — Bob

## Updated
2026-09-22T01:02:00+05:30

## Goal
Interactive architecture diagram with upstream **SOURCE / WHAT / HOW** catalog in the right inspector for every node (A drivers, B combos, C kernels).

## Status
done-for-now — catalog wired; telemetry static copies synced; commit when user asks

## Done
- **Repo:** https://github.com/Ayub-shaik/bob (`master` — commit pending this session)
- **New file:** `diagrams/bob-graph-catalog.js` — 51/51 nodes covered (verified via node script)
- **Inspector:** `bob-graph.js` `renderCatalogSections()` adds SOURCE (link), WHAT, HOW after tier-specific DETAILS
- **Load order:** `bob-graph-data.js` → `bob-graph-catalog.js` → `bob-graph.js` in `architecture.html`
- **Telemetry sync:** copied `bob-graph-catalog.js`, `bob-graph.js`, `architecture.html` to `tomorrowtools/.../static/bob/`; `hub.html` loads catalog script
- **Diagram UX (prior):** band columns, splines, pan/zoom on chart only, click neighbor glow, inspector-only DETAILS (`375da34`)

## Next steps
1. User visual QA — click `graft`, `Token Diet`, `C1` and confirm SOURCE/WHAT/HOW render with working links
2. Rebuild `tomorrowtools` Docker container if hub should show catalog live on telemetry.tomorrowtools.dev
3. `git commit` in bob repo when user requests
4. Optional: dedupe B combo entries (id + name keys are intentional for lookup)

## Gotchas
- Catalog keys Layer B by both `B1`…`B15` **and** combo name — duplicate prose is intentional for `lookup()`
- Internal drivers (spec-lock, ponytail, mem-decay) point at bob repo paths, not external GitHub
- `bob-graph-catalog.js` write was aborted in prior session — now complete
- Do not re-add static PNG/JPG architecture images

## Open decisions
- Whether to rebuild telemetry container automatically after every diagram edit (currently manual copy + docker rebuild)
