#!/usr/bin/env node
const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");

// Configuration
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const feedEndpoint = `${siteUrl}/api/articles-feed`;
const readmePath = path.join(process.cwd(), "README.md");
const maxPosts = 5;
const template = "[$title]($url)";

console.log(
  `🔍 Updating README.md with latest blog posts from ${feedEndpoint}`
);

// Function to fetch the RSS feed
function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch feed: ${res.statusCode}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

// Function to parse RSS XML and extract items
function parseRssFeed(xml) {
  const items = [];
  const itemRegex =
    /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    items.push({
      title: match[1].trim(),
      url: match[2].trim(),
    });
  }

  return items.slice(0, maxPosts);
}

// Function to update README with blog posts
function updateReadme(posts) {
  if (!fs.existsSync(readmePath)) {
    console.error(`❌ README file not found at ${readmePath}`);
    return false;
  }

  let content = fs.readFileSync(readmePath, "utf8");

  // Check if the README has the markers
  if (
    !content.includes("<!-- BLOG-POST-LIST:START -->") ||
    !content.includes("<!-- BLOG-POST-LIST:END -->")
  ) {
    console.error("❌ README is missing the required markers");
    return false;
  }

  // Generate new content for the blog posts section
  const postsList = posts
    .map((post) => {
      return template.replace("$title", post.title).replace("$url", post.url);
    })
    .join("\n");

  // Add newlines for readability
  const newContent = `<!-- BLOG-POST-LIST:START -->\n${postsList}\n<!-- BLOG-POST-LIST:END -->`;

  // Replace the section between markers
  const updatedContent = content.replace(
    /<!-- BLOG-POST-LIST:START -->[\s\S]*?<!-- BLOG-POST-LIST:END -->/,
    newContent
  );

  // Write the updated content back to the README
  fs.writeFileSync(readmePath, updatedContent);

  return true;
}

// Main execution
async function main() {
  try {
    // Fetch and parse the feed
    console.log("📥 Fetching RSS feed...");
    const xml = await fetchFeed(feedEndpoint);
    console.log(`✅ Feed fetched (${xml.length} bytes)`);

    // Parse the feed
    console.log("🔄 Parsing feed...");
    const posts = parseRssFeed(xml);
    console.log(`✅ Found ${posts.length} posts`);

    if (posts.length === 0) {
      console.log("⚠️ No posts found in the feed. Nothing to update.");
      return;
    }

    // Display posts for debugging
    console.log("\nPosts found:");
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title} - ${post.url}`);
    });

    // Update the README
    console.log("\n📝 Updating README...");
    if (updateReadme(posts)) {
      console.log("✅ README updated successfully");
    } else {
      console.log("❌ Failed to update README");
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

main();
