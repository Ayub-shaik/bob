# Disclaimer

Bob is an **agent skill and orchestration toolkit**, not a product guarantee.

## Use at your own risk

- Bob instructs AI coding agents to audit code, trace causal feedback loops, and apply surgical fixes. **It does not replace human judgment**, code review, security review, or production testing.
- Agents can still introduce bugs, break invariants, leak secrets, or misinterpret requirements — even when Bob is active.
- Token savings figures shown in telemetry are **estimates** based on virtualization assumptions (e.g. `rtk`, `context-mode`, AST crux reads). Actual savings vary by repository size, model, and task shape.
- Mock unit tests and static linters are **explicitly disqualified** by Bob as proof of physical UI correctness. You must still verify gestures, scroll behavior, and runtime layout empirically.

## No warranty

This software is provided **"AS IS"**, without warranty of any kind, express or implied. See [LICENSE](LICENSE).

## Third-party tools

Bob orchestrates optional third-party CLIs and MCP servers (Graft, Mnemosyne, Oxlint, Open Code Review, etc.). Each has its own license and terms. You are responsible for installing and complying with those tools.

## Not professional advice

Nothing in this repository constitutes legal, security, or compliance advice. For production systems, run your own CI, security scans, and human review.
