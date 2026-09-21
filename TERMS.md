# Terms of Use

By installing or using Bob, you agree to the following terms.

## 1. License

Bob is distributed under the [MIT License](LICENSE). You may use, modify, and redistribute it subject to that license.

## 2. Acceptable use

- Use Bob to improve agent reliability, reduce token waste, and audit regressions in **your own** projects or with permission.
- Do not use Bob to automate attacks, bypass security controls, or scrape data you are not authorized to access.
- Do not misrepresent Bob telemetry or savings claims in commercial offerings without clear disclosure that figures are estimated.

## 3. Agent behavior

Bob changes how AI agents behave via skills, rules, and optional CLIs. **You remain responsible** for all code committed, deployed, or executed on your machines.

## 4. Telemetry

- Local telemetry is stored at `~/.bob/telemetry/events.jsonl` on **your machine only**.
- Bob does not phone home. Any dashboard you run (`bob-dashboard`) is local unless you explicitly integrate your own hub.
- You may delete telemetry at any time: `bob-telemetry clear` or remove the file manually.

## 5. Optional integrations

MCP servers, linters, and review tools are optional. Bob's install script may suggest global npm/cargo installs; review each dependency before installing.

## 6. Limitation of liability

To the maximum extent permitted by law, the authors and contributors are not liable for any damages arising from use of this software. See [DISCLAIMER.md](DISCLAIMER.md).

## 7. Changes

These terms may be updated in the repository. Continued use after updates constitutes acceptance of the revised terms.
