import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";

const AGENTS_SNIPPET = `## Gadget
- Agent name: Gadget (chief of staff). Run project init with the \`gadget_init\` tool or \`/gadget-init\`.
- RAG first: use open-codebase-index tools (codebase_context, codebase_search, implementation_lookup, call_graph) before reading whole files. Keep \`.opencode/codebase-index.json\` set to Ollama embeddings.
- Memory graph: keep OpenCode running with \`webServerEnabled\` (opencode-mem on 127.0.0.1:4747); use the Memory Graph extension and Retry.
- Preflight: pre-commit hooks (husky + lint-staged + prettier) must pass; run \`setup-pre-commit\` when adding a JS/TS project.
- Skills: grill-with-docs, codebase-design, domain-modeling, improve-codebase-architecture, ponytail, scaffold-exercises, wayfinder, writing-for-agents.
- Git: every project is a git repo; commit with Conventional Commits; keep imports synced via .github/workflows/gadget-sync.yml.
`;

function ensureFile(dir, rel, content) {
  const p = join(dir, rel);
  mkdirSync(join(p, ".."), { recursive: true });
  if (!existsSync(p)) writeFileSync(p, content);
  return p;
}

function readJson(p) { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } }
function writeJson(p, obj) { writeFileSync(p, JSON.stringify(obj, null, 2) + "\n"); }

function initProject(dir) {
  const done = [];
  // RAG config
  const ocDir = join(dir, ".opencode");
  mkdirSync(ocDir, { recursive: true });
  const ragPath = join(ocDir, "codebase-index.json");
  const rag = readJson(ragPath) || {};
  rag.embeddingProvider = rag.embeddingProvider || "ollama";
  writeJson(ragPath, rag);
  done.push(".opencode/codebase-index.json (embeddingProvider=" + rag.embeddingProvider + ")");

  // AGENTS.md
  const agentsPath = join(dir, "AGENTS.md");
  let agents = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : "# AGENTS.md\n";
  if (!agents.includes("## Gadget")) agents = agents.replace(/\n?$/, "\n\n" + AGENTS_SNIPPET);
  writeFileSync(agentsPath, agents);
  done.push("AGENTS.md");

  // .gitignore
  const giPath = join(dir, ".gitignore");
  let gi = existsSync(giPath) ? readFileSync(giPath, "utf8") : "";
  for (const line of ["node_modules/", ".opencode/index/", ".codebase-index/", ".opencode-mem/", "dist/", ".DS_Store"]) {
    if (!gi.includes(line)) gi = gi.replace(/\n?$/, "\n" + line);
  }
  writeFileSync(giPath, gi.trimEnd() + "\n");
  done.push(".gitignore");

  // pre-commit preflight files (safe to add; run setup-pre-commit skill to install deps)
  ensureFile(dir, ".husky/pre-commit", "npx lint-staged\n");
  ensureFile(dir, ".lintstagedrc", JSON.stringify({ "*": "prettier --ignore-unknown --write" }, null, 2) + "\n");
  ensureFile(dir, ".prettierrc", JSON.stringify({ useTabs: false, tabWidth: 2, printWidth: 80, singleQuote: false, trailingComma: "es5", semi: true, arrowParens: "always" }, null, 2) + "\n");
  done.push("pre-commit preflight files (.husky, .lintstagedrc, .prettierrc)");

  // project GitHub Actions to keep imports synced
  const wf = `.github/workflows/gadget-sync.yml`;
  ensureFile(dir, wf, `name: gadget-sync\non:\n  schedule:\n    - cron: "0 6 * * 1"\n  workflow_dispatch:\njobs:\n  sync:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 24\n      - run: npm install -g open-codebase-index\n      - run: npx open-codebase-index status || true\n`);
  done.push(wf);

  // git init + commit
  try {
    if (!existsSync(join(dir, ".git"))) {
      execSync("git init", { cwd: dir, stdio: "ignore" });
      done.push("git init");
    }
    execSync("git add -A", { cwd: dir, stdio: "ignore" });
    execSync('git commit -m "chore: initialize Gadget project" --allow-empty', { cwd: dir, stdio: "ignore" });
    done.push("git commit");
  } catch (e) {
    done.push("git skipped: " + e.message);
  }

  return done;
}

async function ensureDeps() {
  const imports = JSON.parse(readFileSync(new URL("../imports.json", import.meta.url), "utf8"));
  // OpenCode package plugins: check `opencode plugin list` and add missing ones.
  try {
    const list = execSync("opencode plugin list", { stdio: ["ignore", "pipe", "ignore"] }).toString();
    for (const spec of imports.opencodePlugins || []) {
      const name = spec.replace(/@.*$/, "");
      if (!list.includes(name)) execSync(`opencode plugin add ${JSON.stringify(spec)}`, { stdio: "ignore" });
    }
  } catch {}
  // OpenChamber extensions: if OpenChamber config exists, clone + register missing ones (user still approves capabilities in UI).
  try {
    const extCfgPath = join(homedir(), ".config/openchamber/extensions.json");
    if (!existsSync(extCfgPath)) return;
    const extDir = join(homedir(), ".config/openchamber/extensions");
    const d = JSON.parse(readFileSync(extCfgPath, "utf8"));
    let changed = false;
    for (const e of imports.openchamberExtensions || []) {
      const path = join(extDir, e.dir);
      if (!existsSync(join(path, ".git"))) {
        mkdirSync(extDir, { recursive: true });
        try { execSync(`git clone --depth 1 ${JSON.stringify(e.url)} ${JSON.stringify(path)}`, { stdio: "ignore" }); } catch {}
      }
      if (!d.paths.includes(path)) { d.paths.push(path); changed = true; }
      d.sources = d.sources || {}; if (d.sources[path] !== "git") { d.sources[path] = "git"; changed = true; }
      d.gitOrigins = d.gitOrigins || {}; if (!d.gitOrigins[path]) { d.gitOrigins[path] = { url: e.url, gitIdentityId: "global" }; changed = true; }
      d.storageIds = d.storageIds || {}; if (!d.storageIds[e.dir]) { d.storageIds[e.dir] = randomUUID(); changed = true; }
    }
    if (changed) writeFileSync(extCfgPath, JSON.stringify(d, null, 2) + "\n");
  } catch {}
}

export default {
  id: "gadget",
  async setup(ctx) {
    void ensureDeps().catch(() => {});
    const input = {
      type: "object",
      properties: {
        directory: { type: "string", description: "Project directory; defaults to the current project" }
      },
      additionalProperties: false
    };
    const description = "Initialize the current project as a Gadget project: RAG config, AGENTS.md, gitignore, pre-commit preflight, GitHub Actions sync, git init/commit, memory-graph hint.";
    const execute = async (args, toolContext) => {
      const dir = args?.directory || toolContext?.directory || ctx?.location?.directory || process.cwd();
      const done = initProject(dir);
      return {
        content: [{
          type: "text",
          text: "Gadget init complete in " + dir + ":\n- " + done.join("\n- ") +
            "\n\nNext: run /index (open-codebase-index) and open the Memory Graph extension, then Retry."
        }]
      };
    };
    if (ctx?.tool?.transform) {
      await ctx.tool.transform((editor) => editor.add({ name: "gadget_init", description, input, execute }));
    } else if (typeof ctx?.registerTool === "function") {
      ctx.registerTool("gadget_init", { description, input, execute });
    }
  }
};

if (import.meta.url === `file://${process.argv[1]}` && process.argv.includes("--selftest")) {
  console.log("gadget plugin selftest ok");
}
