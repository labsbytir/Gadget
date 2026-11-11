# AGENTS.md — Gadget

Gadget is an OpenChamber extension + OpenCode plugin. See README.md.

- Panel: `panel/index.html` + `panel/main.js` (ship built JS; no build step here).
- OpenCode plugin entry: `plugin/index.js` — default export `{ id, setup }`, registers `gadget_init` tool.
- Skills: `skills/*` contributed to every agent via the extension manifest (`contributes.skills`).
- Imports: `imports.json` + `scripts/sync-imports.sh`; keep in sync with `opencode plugin update` and extension git pulls.
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/sync-imports.yml`.

Rules: RAG-first with open-codebase-index; memory graph via opencode-mem; pre-commit preflight via setup-pre-commit; commit with Conventional Commits.
