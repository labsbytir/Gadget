(function () {
  var out = document.getElementById("out");
  function say(msg) { out.textContent = msg; }
  function prompt(text) {
    // OpenChamber exposes host.prompt when capabilities are granted; fall back to clipboard.
    try {
      if (window.openchamber && window.openchamber.prompt) {
        window.openchamber.prompt({ text: text, send: true });
        say("Sent to session.");
        return;
      }
    } catch (e) {}
    navigator.clipboard.writeText(text).then(function () { say("Copied: " + text); });
  }
  document.getElementById("init").onclick = function () { prompt("/gadget-init"); };
  document.getElementById("rag").onclick = function () { prompt("Enable RAG: run /index with open-codebase-index (embeddingProvider ollama), then use codebase_context/codebase_search before reading files."); };
  document.getElementById("mem").onclick = function () { prompt("Update memory graph: keep OpenCode running with webServerEnabled, open Memory Graph extension, click Retry."); };
})();
