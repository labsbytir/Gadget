#!/usr/bin/env bash
# Keep OpenCode plugins and OpenChamber extensions installed and up to date.
# Usage: sync-imports.sh [--check]
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
IMPORTS="$ROOT/imports.json"
CHECK=0
[ "${1:-}" = "--check" ] && CHECK=1

need() { # name -> exit 1 if missing
  if [ "$CHECK" = "1" ]; then echo "MISSING: $1" >&2; return 1; fi
  return 0
}

# OpenCode plugins
plugins_list="$(opencode plugin list 2>/dev/null || true)"
for p in $(node -e 'const i=require(process.argv[1]); for (const p of i.opencodePlugins) console.log(p.replace(/@.*$/, ""))' "$IMPORTS"); do
  if echo "$plugins_list" | grep -q "$p"; then
    echo "plugin ok: $p"
  else
    if [ "$CHECK" = "1" ]; then echo "MISSING plugin: $p" >&2; exit 1; fi
    echo "installing plugin: $p"
    spec=$(node -e 'const i=require(process.argv[1]); console.log(i.opencodePlugins.find(x=>x.replace(/@.*$/,"")===process.argv[2])||process.argv[2])' "$IMPORTS" "$p")
    opencode plugin add "$spec"
  fi
done
if [ "$CHECK" = "0" ]; then opencode plugin update >/dev/null 2>&1 || true; fi

# OpenChamber extensions (git clones under the extensions dir)
ext_dir="${OPENCHAMBER_EXTENSIONS_DIR:-$HOME/.config/openchamber/extensions}"
mkdir -p "$ext_dir"
for entry in $(node -e 'const i=require(process.argv[1]); for (const e of i.openchamberExtensions) console.log(e.dir+"|"+e.url)' "$IMPORTS"); do
  dir="${entry%%|*}"; url="${entry#*|}"
  path="$ext_dir/$dir"
  if [ -d "$path/.git" ]; then
    echo "extension ok: $dir"
    if [ "$CHECK" = "0" ]; then git -C "$path" pull --ff-only >/dev/null 2>&1 || true; fi
  else
    if [ "$CHECK" = "1" ]; then echo "MISSING extension: $dir" >&2; exit 1; fi
    echo "cloning extension: $dir"
    git clone --depth 1 "$url" "$path"
  fi
done

echo "sync-imports done"
