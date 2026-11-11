# Security Policy

Gadget is an OpenChamber extension + OpenCode plugin. It runs with your user access when enabled, and its local service / plugin code can read project files and run git.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Report privately to the maintainers via GitHub (security advisory on https://github.com/labsbytir/Gadget/security/advisories/new, or a maintainer contact). Include reproduction steps and impact. We will acknowledge within 72 hours and work on a fix.

## Scope

- The extension panel is sandboxed in OpenChamber and talks through the host API with declared capabilities.
- The OpenCode plugin (`plugin/`) runs inside OpenCode with full user access — review before enabling.
- `scripts/sync-imports.sh` installs third-party plugins/extensions from `imports.json`; review that list before running.
- Never commit tokens, `~/.opencode-mem/.auth-token`, or absolute paths.

## Safe use

- Approve only the capabilities you need.
- Keep OpenCode/OpenChamber and plugins updated (`opencode plugin update`, extension updates).
- Run `bash scripts/sync-imports.sh --check` to see what is installed without changing anything.
