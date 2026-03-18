/**
 * Background service worker — handles all Sanity API fetch calls.
 *
 * The popup and options pages send messages here instead of making
 * direct fetch calls, which avoids CORS issues with Sanity's API.
 */

import {
  fetchFolders,
  createFolder,
  createBookmark,
  checkBookmarkExists,
  loadConfig,
} from "./sanity-api.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message).then(sendResponse);
  // Return true to keep the message channel open for async response
  return true;
});

async function handleMessage({ action, data }) {
  try {
    // Load config from storage for every request (service worker may restart)
    const config = data?.config || (await loadConfig());

    if (!config) {
      return { error: "Sanity credentials not configured." };
    }

    switch (action) {
      case "fetchFolders": {
        const folders = await fetchFolders(config);
        return { result: folders };
      }

      case "createFolder": {
        const id = await createFolder(config, data.folderName);
        return { result: id };
      }

      case "createBookmark": {
        const result = await createBookmark(config, {
          title: data.title,
          url: data.url,
          folderId: data.folderId,
        });
        return { result };
      }

      case "checkBookmarkExists": {
        const exists = await checkBookmarkExists(config, data.url);
        return { result: exists };
      }

      default:
        return { error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}
