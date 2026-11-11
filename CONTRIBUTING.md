# Contributing to Gadget

Gadget is open source under **GPL-3.0**. Anyone can use it, fork it, and contribute.

## Ways to contribute

- Open an issue for bugs, UX problems, or ideas.
- Open a PR for code, docs, skills, extensions imports, or workflows.
- Improve the bundled skills in `skills/` — they are plain Markdown and everyone benefits.
- Add more OpenCode plugins / OpenChamber extensions to `imports.json` + `scripts/sync-imports.sh`.

## Workflow

1. Fork https://github.com/labsbytir/Gadget and clone your fork.
2. Create a branch: `git checkout -b feat/my-change`.
3. Change code, then run checks locally:
   ```bash
   node --check plugin/index.js
   node --check panel/main.js
   bash scripts/sync-imports.sh --check
   ```
4. Commit with Conventional Commits (`feat:`, `fix:`, `docs:` …).
5. Push and open a PR against `main`. CI runs `.github/workflows/ci.yml`; the weekly `sync-imports.yml` keeps plugin/extension imports fresh.

## Pull request checklist

- [ ] What problem does this solve? (link issue if any)
- [ ] Screenshots/video for panel/UI changes
- [ ] `npm run check` / CI green
- [ ] No secrets, tokens, or absolute user paths committed
- [ ] README updated if behavior/install changes
- [ ] License header not required — repo is GPL-3.0 as a whole

## Code of Conduct

See `CODE_OF_CONDUCT.md`. Be direct, kind, and constructive.

## Security

See `SECURITY.md`. Do not open public issues for vulnerabilities; report privately first.
