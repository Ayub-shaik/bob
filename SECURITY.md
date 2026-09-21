# Security

## What Bob stores locally

- Telemetry: `~/.bob/telemetry/events.jsonl` on **your machine only** (never committed to this repo).
- No cloud phone-home. No API keys required for Bob core.

## Before publishing your fork

Do not commit:

- Personal paths with usernames (use `install.sh` defaults or docs placeholders)
- MCP configs with tokens
- Telemetry files or query text containing proprietary code paths

## Reporting issues

Open a GitHub issue on this repository for security-related bugs in Bob skill/rules/CLI.
