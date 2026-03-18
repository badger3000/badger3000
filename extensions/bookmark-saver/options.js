import { loadConfig, saveConfig, fetchFolders } from "./sanity-api.js";

const form = document.getElementById("settings-form");
const projectIdInput = document.getElementById("projectId");
const datasetInput = document.getElementById("dataset");
const tokenInput = document.getElementById("token");
const toggleTokenBtn = document.getElementById("toggle-token");
const testBtn = document.getElementById("test-btn");
const statusEl = document.getElementById("status");

// ── Load saved config ────────────────────────────────────────────────────────
async function init() {
  const config = await loadConfig();
  if (config) {
    projectIdInput.value = config.projectId;
    datasetInput.value = config.dataset;
    tokenInput.value = config.token;
  }
}

init();

// ── Show/hide token ──────────────────────────────────────────────────────────
toggleTokenBtn.addEventListener("click", () => {
  const isPassword = tokenInput.type === "password";
  tokenInput.type = isPassword ? "text" : "password";
});

// ── Status messages ──────────────────────────────────────────────────────────
function showStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

// ── Save ─────────────────────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await saveConfig({
      projectId: projectIdInput.value.trim(),
      dataset: datasetInput.value.trim(),
      token: tokenInput.value.trim(),
    });
    showStatus("Settings saved!", "success");
  } catch (err) {
    showStatus(`Failed to save: ${err.message}`, "error");
  }
});

// ── Test connection ──────────────────────────────────────────────────────────
testBtn.addEventListener("click", async () => {
  const config = {
    projectId: projectIdInput.value.trim(),
    dataset: datasetInput.value.trim(),
    token: tokenInput.value.trim(),
  };

  if (!config.projectId || !config.token) {
    showStatus("Fill in all fields first.", "error");
    return;
  }

  showStatus("Testing connection...", "info");
  testBtn.disabled = true;

  try {
    const folders = await fetchFolders(config);
    showStatus(
      `Connected! Found ${folders.length} bookmark folder${folders.length !== 1 ? "s" : ""}.`,
      "success"
    );
  } catch (err) {
    showStatus(`Connection failed: ${err.message}`, "error");
  } finally {
    testBtn.disabled = false;
  }
});
