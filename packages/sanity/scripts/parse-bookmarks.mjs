import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const html = readFileSync(
  process.env.HOME + "/Desktop/brave-bookmarks/bookmarks_3_18_26.html",
  "utf-8"
);

const lines = html.split("\n");
const bookmarks = [];
const folderStack = ["Bookmarks"];

const folderRegex = /<H3[^>]*>([^<]+)<\/H3>/i;
const linkRegex = /<A\s+HREF="([^"]+)"[^>]*>([^<]+)<\/A>/i;
const dlOpenRegex = /<DL>/i;
const dlCloseRegex = /<\/DL>/i;

for (const line of lines) {
  const folderMatch = line.match(folderRegex);
  if (folderMatch) {
    folderStack.push(folderMatch[1].trim());
    continue;
  }

  if (dlCloseRegex.test(line) && !dlOpenRegex.test(line)) {
    if (folderStack.length > 1) folderStack.pop();
    continue;
  }

  const linkMatch = line.match(linkRegex);
  if (linkMatch) {
    bookmarks.push({
      title: linkMatch[2].trim(),
      url: linkMatch[1],
      folder: folderStack[folderStack.length - 1],
    });
  }
}

// Deduplicate by URL
const seen = new Set();
const unique = bookmarks.filter((b) => {
  if (seen.has(b.url)) return false;
  seen.add(b.url);
  return true;
});

// Get unique folders for reference
const folders = [...new Set(unique.map((b) => b.folder))].sort();

writeFileSync(
  join(__dirname, "..", "data", "bookmarks.json"),
  JSON.stringify(unique, null, 2)
);

console.log(`Parsed ${unique.length} unique bookmarks from ${bookmarks.length} total`);
console.log(`Folders: ${folders.join(", ")}`);
