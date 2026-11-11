# Gadget

OpenChamber extension + OpenCode plugin that turns every project into a **Gadget project**: an agent named Gadget (chief of staff) that is initialized per project and keeps the memory graph, codebase RAG, git/GitHub, pre-commit preflight, and skill set in sync.

## What it installs

OpenCode plugins (global, via `scripts/sync-imports.sh` and `imports.json`):

- `opencode-mem` — persistent memory + web UI on `127.0.0.1:4747` (`webServerEnabled`)
- `open-codebase-index` — semantic codebase RAG (embeddings + BM25 + call graph) from https://github.com/Helweg/open-codebase-index
- `opencode-snip` — https://github.com/VincentHardouin/opencode-snip (prefix shell output with snip to cut tokens)

OpenChamber extensions:

- `openchamber-memory-graph-ui` — Memory Graph rail panel/full page for opencode-mem
- `gadget` — this repo (rail panel + full page + OpenCode plugin + skills)
- `kanban-board` — https://github.com/mannu150/openchamber-kanban
- `openchamber-git-graph` — https://github.com/MltStephane/openchamber-git-graph

Agent + automation:

- OpenCode agent **`gadget`** is registered in `~/.config/opencode/opencode.json`; pick its default model in **Settings → Agents** from your enabled OpenCode providers/models.
- A user-scope loop `~/.agents/loops/gadget-start.md` runs Gadget every 5 minutes in every project (edit `model`/`agent`/`schedule` there; enable/disable in Scheduled Tasks). It runs `gadget_init` if needed, keeps RAG + memory graph up, updates project todos/plans via the project knowledge tool, and syncs Kanban with task progress.

Skills shipped in `skills/` (contributed to every agent while the extension is on): `code-review`, `codebase-design`, `domain-modeling`, `grilling`, `grill-with-docs`, `improve-codebase-architecture`, `ponytail`, `pr`, `research`, `scaffold-exercises`, `setup-pre-commit`, `tdd`, `wayfinder`, `wizard`, `writing-for-agents`.

## Install

OpenChamber → Settings → Extensions → Add:

```
https://github.com/labsbytir/Gadget.git
```

Approve capabilities (`prompt`, `sessions`, `files`, `shells`) and the bundled OpenCode plugin. Then run the import sync once:

```
bash scripts/sync-imports.sh
```

## Use in every project

Run the Gadget init in a project (agent tool or panel button):

```
gadget_init
# or send: /gadget-init
```

It writes:

- `.opencode/codebase-index.json` → `embeddingProvider: "ollama"` (local RAG; run `/index` to build the index)
- `AGENTS.md` → Gadget rules: RAG-first, memory graph, pre-commit preflight, skills, git
- `.gitignore`, `.husky/pre-commit`, `.lintstagedrc`, `.prettierrc`
- `.github/workflows/gadget-sync.yml` to keep imports/index fresh
- `git init` + initial commit

Then:

1. Keep OpenCode running with `webServerEnabled` so opencode-mem serves `127.0.0.1:4747`; open the Memory Graph extension and press **Retry**.
2. Run `/index` (open-codebase-index) and use `codebase_context` / `codebase_search` / `implementation_lookup` / `call_graph` before reading whole files.
3. Keep Ollama running with `nomic-embed-text` pulled for local embeddings.

## Keeping things synced

- Locally: `npm run sync-imports` (or `bash scripts/sync-imports.sh`).
- In GitHub: `.github/workflows/sync-imports.yml` runs weekly and on demand; `--check` fails if an import is missing.

Compatible with https://opencode.ai/docs/plugins/, https://docs.openchamber.dev/sdk/, and https://github.com/Helweg/open-codebase-index.
