# Contributing to Bob

Thank you for your interest in contributing to Bob! Bob exists to end the "You broke Y while doing X" rework loop in AI agent development.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Ayub-shaik/bob.git
   cd bob
   ```
2. Verify system prerequisites:
   - Node.js >= 18.0.0
   - npm >= 9.0.0
   - Git >= 2.30.0
   - (Optional) Rust/Cargo for `rtk` and `worktrunk` compilation

3. Run diagnostic check:
   ```bash
   ./scripts/check-mcp.sh
   ```

4. Run the local installer to link skills and rules into your local Cursor environment:
   ```bash
   ./scripts/install.sh
   ```

## Design principles

- **Core stays small:** skill + rules + telemetry + `bob-ensure`. No bulk npm/cargo installs in `install.sh`.
- **Drivers on demand:** optional tools are invoked or installed when a task needs them, with documented fallbacks.
- **No corners cut on forensic quality:** slim packaging, not slim procedure.

## Pull Request Guidelines

- Ensure any new skills or rules follow standard Cursor Agent Skill conventions (`SKILL.md` with YAML frontmatter).
- Do not introduce dependencies that cause unnecessary prompt bloat or whole-file reading loops.
- New optional drivers belong in `bob-ensure` + SKILL Step 1.5 table — not in default install.
- Update diagrams and documentation if altering the combo topology or the 4-step forensic procedure.
