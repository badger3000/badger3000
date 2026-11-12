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

/**
 * Sanity's CORS check rejects the extension's origin, so the `Origin` header is
 * removed from its API calls. The rule is registered here rather than in a
 * static rules file because it must name this extension's id: scoped by
 * `initiatorDomains`, it leaves every other site's requests to Sanity (the
 * Studio's, for one) untouched. Re-registered on each worker start; replacing
 * rule 1 with itself is harmless.
 */
const STRIP_ORIGIN_RULE_ID = 1;
chrome.declarativeNetRequest
  .updateDynamicRules({
    removeRuleIds: [STRIP_ORIGIN_RULE_ID],
    addRules: [
      {
        id: STRIP_ORIGIN_RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [{ header: "Origin", operation: "remove" }],
        },
        condition: {
          urlFilter: "||api.sanity.io/",
          initiatorDomains: [chrome.runtime.id],
          resourceTypes: ["xmlhttprequest"],
        },
      },
    ],
  })
  .catch((err) => console.error("Could not register the Origin rule:", err));

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
