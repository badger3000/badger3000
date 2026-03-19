/**
 * Sanity HTTP API module — zero dependencies.
 * All functions accept a config object: { projectId, dataset, token }
 */

const API_VERSION = "v2024-03-09";

function apiUrl(config, endpoint) {
  return `https://${config.projectId}.api.sanity.io/${API_VERSION}/data/${endpoint}/${config.dataset}`;
}

function headers(config) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.token}`,
  };
}

/**
 * Parse a Sanity API error response into a readable message.
 */
async function parseError(res, fallback) {
  try {
    const body = await res.json();
    const msg = body?.error?.description || body?.message || body?.error || "";
    if (msg) return `${fallback}: ${msg}`;
  } catch {
    // response wasn't JSON
  }
  if (res.status === 403) {
    return `${fallback}: Permission denied. Your token may need Editor (write) permissions — Viewer tokens can only read.`;
  }
  return `${fallback}: ${res.status} ${res.statusText}`;
}

/**
 * Deterministic slug from a folder name.
 * Must match the pattern in import-bookmarks.mjs / migrate-bookmark-folders.mjs
 */
export function folderSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Deterministic base64url encoding of a URL string.
 * Must match Node's Buffer.from(url).toString('base64url')
 */
export function base64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Fetch all bookmark folders, sorted A-Z.
 */
export async function fetchFolders(config) {
  const query = encodeURIComponent(
    '*[_type == "bookmarkFolder"] | order(name asc) { _id, name }'
  );
  const res = await fetch(`${apiUrl(config, "query")}?query=${query}`, {
    headers: headers(config),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to fetch folders"));
  }

  const data = await res.json();
  return data.result;
}

/**
 * Create a new bookmarkFolder document. Returns the folder _id.
 */
export async function createFolder(config, folderName) {
  const id = `bookmarkFolder-${folderSlug(folderName)}`;

  const res = await fetch(apiUrl(config, "mutate"), {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify({
      mutations: [
        {
          createIfNotExists: {
            _id: id,
            _type: "bookmarkFolder",
            name: folderName,
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to create folder"));
  }

  return id;
}

/**
 * Create a bookmark document with a folder reference.
 */
export async function createBookmark(config, { title, url, folderId }) {
  const id = `bookmark-${base64urlEncode(url).slice(0, 96)}`;

  const res = await fetch(apiUrl(config, "mutate"), {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify({
      mutations: [
        {
          createIfNotExists: {
            _id: id,
            _type: "bookmark",
            title,
            url,
            folder: {
              _type: "reference",
              _ref: folderId,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to save bookmark"));
  }

  return { id, success: true };
}

/**
 * Check if a bookmark already exists for a given URL.
 */
export async function checkBookmarkExists(config, url) {
  const query = encodeURIComponent(
    `count(*[_type == "bookmark" && url == $url]) > 0`
  );
  const params = encodeURIComponent(JSON.stringify({ url }));
  const res = await fetch(
    `${apiUrl(config, "query")}?query=${query}&$url=${params}`,
    { headers: headers(config) }
  );

  if (!res.ok) return false;

  const data = await res.json();
  return data.result === true;
}

/**
 * Load Sanity config from chrome.storage.
 * Project ID and dataset from sync, token from local.
 */
export async function loadConfig() {
  const sync = await chrome.storage.sync.get([
    "sanityProjectId",
    "sanityDataset",
  ]);
  const local = await chrome.storage.local.get(["sanityToken"]);

  if (!sync.sanityProjectId || !local.sanityToken) {
    return null;
  }

  return {
    projectId: sync.sanityProjectId,
    dataset: sync.sanityDataset || "production",
    token: local.sanityToken,
  };
}

/**
 * Save Sanity config to chrome.storage.
 */
export async function saveConfig({ projectId, dataset, token }) {
  await chrome.storage.sync.set({
    sanityProjectId: projectId,
    sanityDataset: dataset || "production",
  });
  await chrome.storage.local.set({ sanityToken: token });
}
