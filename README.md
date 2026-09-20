# Bob: Forensic Audit, Anti-Regression & Autonomic Agent Pipeline

> **"You broke Y while doing X" ends here.**

Bob is a forensic audit supervisor, token optimization pipeline, and anti-regression engine for AI-assisted coding agents (Cursor, Claude Code, Codex, Windsurf, OpenCode).

---

## The Core Problems Bob Solves

1. **The Rework & Regression Trap**: When an AI agent modifies code to implement or fix feature A, it frequently worsens features B, C, and D because it has no awareness of caller blast radiuses and no invariant protection.
2. **Context Window Exhaustion**: Agents brute-force read 1,000+ line files repeatedly across turns, burning 80,000+ tokens and causing hallucination loops.
3. **Optimistic False "Done" Claims**: Agents declare success after shallow implementations (placeholders, stubs, broken invariants) without proof.
4. **Chat Amnesia & Unstructured Instructions**: Users say *"I asked earlier to do a set of changes but it didn't execute properly"*, and normal agents have no forensic mechanism to audit prior instructions against git reality.

---

## Architecture & Neural-Wiring Topology

Bob integrates 6 specialized, non-interfering tool combos into a unified routing architecture:

```
=======================================================================================================================
                                          BOB TELECOMMUNICATIONS WIRE GRAPH
=======================================================================================================================

 [ COLUMN A: RAW DRIVERS ]                     [ COLUMN B: ISOLATED COMBOS ]                    [ COLUMN C: PANELS ]
 -------------------------                     -----------------------------                    --------------------
 (1) rtk (CLI proxy) ══════════════════╗
 (2) context-mode (Virtualization) ════╬══► [ COMBO-1: TOKEN & CONTEXT DIET ] ═════════════════╗
 (3) Graft (AST Cruxes) ═══════════════╝     (AST Cruxes, 90% CLI token strip)                  ║
                                                                                                ╠══► [ PANEL-I: CONTEXT ]
 (4) Mnemosyne (Decisions) ════════════╗                                                        ║    (Zero-Loss Context Bus)
 (5) WeKnora (Enterprise RAG) ═════════╬══► [ COMBO-2: RECALL & KNOWLEDGE BASE ] ══════════════╝
 (6) compact-custome ══════════════════╝     (Durable Graph, Decisions, Decay)
                                                                                                
 (7) i-have-adhd (Front-load) ═════════╗                                                        
 (8) caveman / caveman-review ═════════╬══► [ COMBO-3: DENSE SPEC & SIGNALING ] ═══════════════╗
 (9) requirements-manager ═════════════╝     (Non-Negotiable Invariants, 0 Fluff)              ║
                                                                                                ╠══► [ PANEL-II: GOVERNANCE ]
 (10) open-code-review (Alibaba OCR) ══╗                                                        ║    (Anti-Regression & Audit)
 (11) ponytail-review (Diff Bloat) ════╬══► [ COMBO-4: MULTI-STAGE CODE AUDIT ] ═══════════════╝
 (12) Bugbot + acceptance-review ══════╝     (Line-Level Static Pipeline, Blast-Radius)         
                                                                                                
 (13) max-sixty/worktrunk ═════════════╗                                                        
 (14) SuperLogicAI/Logic-Loop ═════════╬══► [ COMBO-5: WORKTREE & LOOP CONTROL ] ══════════════╗
 (15) task-supervisor ═════════════════╝     (Branch Worktrees, Loop Breaker, 2-Retry)         ║
                                                                                                ╠══► [ PANEL-III: RUNTIME ]
 (16) addyosmani/agent-skills ═════════╗                                                        ║    (Polyglot Platform)
 (17) design-taste-frontend ═══════════╬══► [ COMBO-6: POLYGLOT PLATFORM ENGINE ] ═════════════╝
 (18) Android Compose / Orca / Artemis ╝     (Decoupled Web, Native Kotlin, Desktop, Android)

=======================================================================================================================
```

---

## The 4-Tier Large Repository Triage (Under 1,500 Tokens)

In large codebases (thousands of files), Bob does not run repository-wide `grep` or full-file reads:

1. **Topological Orientation (`graft_repo_map`)**: Obtains module clusters and hotspots in ~300 tokens.
2. **Needle Extraction (`graft_find_code`)**: Extracts only the $\le 8$-line crux definition of the target function.
3. **Blast Radius & Call Graph (`graft_trace_calls`)**: Maps callers and callees in both directions before a single character is edited.
4. **Invariant & Decision Recall (`mnemosyne_recall` + `.cursor/rules/*.mdc`)**: Verifies locked rules and past architectural decisions.

---

## Token Economics: 90%–93% Net Token Reduction

| Step in Debugging / Feature Flow | Traditional Agent Workflow | Bob Autonomic Pipeline | Net Savings |
|---|---|---|---|
| **1. Locating Code** | Reads 3–5 full files (~20,000 tokens) | `graft_find_code` (~500 tokens) | **~97%** |
| **2. Understanding Callers** | Reads caller files (~15,000 tokens) | `graft_trace_calls` AST (~300 tokens) | **~97%** |
| **3. Command Outputs** | Raw build/git stdout (~10,000 tokens) | `rtk` + `context-mode` (~1,000 tokens) | **~90%** |
| **4. Applying Fix** | 400-line rewrite + narrative (~3,500 tokens) | Surgical `StrReplace` (~400 tokens) | **~88%** |
| **5. Rework & Regressions** | Breaks other UI $\rightarrow$ 3 rework turns (~60,000 tokens) | Invariant Locks $\rightarrow$ clean pass on Turn 1 | **100% elimination** |
| **Total Turn Cycle** | **~70,000 – 130,000 tokens** | **~4,000 – 9,000 tokens** | **~92% Net Reduction** |

---

## Invocation

You can trigger Bob anytime in your agent chat by saying:
- `"bob"` or `"/bob"`
- `"bob, I asked earlier to do a set of changes but it didn't execute properly"`
- `"bob audit"`

Bob immediately stops speculative code editing, harvests the prior intent, audits git diffs against reality, reports fulfilled vs. omitted vs. regressed items, and issues a strict, numbered correction order.

---

## Repository Structure

```
bob/
├── README.md                          # Architecture and operational manual
├── skills/
│   └── bob/
│       └── SKILL.md                   # The core forensic audit & correction skill
├── rules/
│   └── bob.mdc                        # Cursor always-on trigger rule
├── diagrams/                          # Telecommunications and circular ring blueprints
│   ├── 01_switchboard_wire_graph.png
│   └── 02_circular_ring_crossconnect.png
├── bin/
│   └── bob-audit                      # Standalone CLI audit helper
└── package.json
```
