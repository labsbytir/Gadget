# AGENTS.md — Gadget

Gadget is an OpenChamber extension + OpenCode plugin. See README.md.

- Panel: `panel/index.html` + `panel/main.js` (ship built JS; no build step here).
- OpenCode plugin entry: `plugin/index.js` — default export `{ id, setup }`, registers `gadget_init` tool.
- Skills: `skills/*` contributed to every agent via the extension manifest (`contributes.skills`).
- Imports: `imports.json` + `scripts/sync-imports.sh`; keep in sync with `opencode plugin update` and extension git pulls (includes kanban + git-graph extensions).
- Automation: `loops/gadget-start.md` is the user-scope loop template; the OpenCode agent `gadget` is registered in global `opencode.json` and its model is chosen in Settings → Agents.
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/sync-imports.yml`.

Rules: RAG-first with open-codebase-index; memory graph via opencode-mem; Kanban via mannu150/openchamber-kanban synced from project knowledge todos/plans; git graph via MltStephane/openchamber-git-graph; pre-commit preflight via setup-pre-commit; commit with Conventional Commits.

Agent: `gadget` (model unset → choose in Settings → Agents). Continuous start loop: `.agents/loops/gadget-start.md` (user copy at `~/.agents/loops/gadget-start.md`).
