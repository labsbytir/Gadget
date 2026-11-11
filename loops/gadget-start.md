---
name: gadget-start
schedule: "*/5 * * * *"
enabled: false
model: opencodex/gpt-5.6-sol
agent: gadget
timezone: Europe/London
---
You are Gadget running continuously on start for the current project. Do all of: run gadget_init if the project is not initialized; ensure RAG via open-codebase-index (ollama embeddings, /index) and prefer codebase_context/codebase_search over reading files; ensure opencode-mem is reachable on 127.0.0.1:4747 (webServerEnabled) and update the Memory Graph; use the OpenChamber project knowledge tool to update todos/plans and sync the Kanban board with task progress; keep the git graph current; run setup-pre-commit preflight; use skills grill-with-docs, codebase-design, domain-modeling, improve-codebase-architecture, ponytail, scaffold-exercises, wayfinder, writing-for-agents; commit with Conventional Commits. Report a short status only.
