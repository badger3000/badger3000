import {
  loadConfig,
  fetchFolders,
  createFolder,
  createBookmark,
  checkBookmarkExists,
  folderSlug,
} from "./sanity-api.js";

// ── DOM refs ─────────────────────────────────────────────────────────────────
const noConfigView = document.getElementById("no-config");
const mainView = document.getElementById("main");
const form = document.getElementById("bookmark-form");
const titleInput = document.getElementById("title");
const urlInput = document.getElementById("url");
const folderSelect = document.getElementById("folder");
const newFolderBtn = document.getElementById("new-folder-btn");
const newFolderRow = document.getElementById("new-folder-row");
const newFolderName = document.getElementById("new-folder-name");
const cancelNewFolder = document.getElementById("cancel-new-folder");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");
const openSettingsBtn = document.getElementById("open-settings");
const openSettingsLink = document.getElementById("open-settings-link");

let config = null;

// ── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  config = await loadConfig();

  if (!config) {
    noConfigView.classList.remove("hidden");
    return;
  }

  mainView.classList.remove("hidden");

  // Get current tab info
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (tab) {
    titleInput.value = tab.title || "";
    urlInput.value = tab.url || "";
  }

  // Load folders
  await loadFolders();

  // Check if already bookmarked
  if (tab?.url) {
    try {
      const exists = await checkBookmarkExists(config, tab.url);
      if (exists) {
        showStatus("This page is already bookmarked.", "exists");
      }
    } catch {
      // Silently ignore — non-critical check
    }
  }
}

init();

// ── Load folders into select ─────────────────────────────────────────────────
async function loadFolders() {
  try {
    const folders = await fetchFolders(config);
    folderSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = "Select a folder...";
    folderSelect.appendChild(placeholder);

    for (const folder of folders) {
      const opt = document.createElement("option");
      opt.value = folder._id;
      opt.textContent = folder.name;
      folderSelect.appendChild(opt);
    }
  } catch (err) {
    showStatus(`Failed to load folders: ${err.message}`, "error");
  }
}

// ── New folder toggle ────────────────────────────────────────────────────────
newFolderBtn.addEventListener("click", () => {
  newFolderRow.classList.remove("hidden");
  folderSelect.disabled = true;
  newFolderName.focus();
});

cancelNewFolder.addEventListener("click", () => {
  newFolderRow.classList.add("hidden");
  newFolderName.value = "";
  folderSelect.disabled = false;
});

// ── Save bookmark ────────────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  const isNewFolder = !newFolderRow.classList.contains("hidden");
  const newName = newFolderName.value.trim();

  if (!title || !url) {
    showStatus("Title and URL are required.", "error");
    return;
  }

  if (isNewFolder && !newName) {
    showStatus("Enter a folder name.", "error");
    return;
  }

  if (!isNewFolder && !folderSelect.value) {
    showStatus("Select a folder.", "error");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  hideStatus();

  try {
    let folderId;

    if (isNewFolder) {
      folderId = await createFolder(config, newName);
      // Add the new folder to the dropdown for future use in this session
      const opt = document.createElement("option");
      opt.value = folderId;
      opt.textContent = newName;
      opt.selected = true;
      folderSelect.appendChild(opt);
      // Reset new folder UI
      newFolderRow.classList.add("hidden");
      newFolderName.value = "";
      folderSelect.disabled = false;
    } else {
      folderId = folderSelect.value;
    }

    await createBookmark(config, { title, url, folderId });

    showStatus("Bookmark saved!", "success");
    saveBtn.textContent = "Saved!";

    // Auto-close after a brief moment
    setTimeout(() => window.close(), 1200);
  } catch (err) {
    showStatus(`Error: ${err.message}`, "error");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Bookmark";
  }
});

// ── Settings links ───────────────────────────────────────────────────────────
openSettingsBtn?.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

openSettingsLink?.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// ── Status helpers ───────────────────────────────────────────────────────────
function showStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function hideStatus() {
  statusEl.className = "status hidden";
}
