#!/usr/bin/env node
const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");

// Configuration
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const productionUrl = "https://www.badger3000.com"; // Your production URL
const feedEndpoint = `${siteUrl}/api/articles-feed`;
const readmePath = path.join(process.cwd(), "README.md");
const maxPosts = 5;

console.log(
  `🔍 Updating README.md with latest blog posts from ${feedEndpoint}`
);

// Function to fetch the RSS feed
function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching feed from: ${url}`);
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
      .on("error", (err) => {
        console.error("Connection error:", err.message);
        reject(err);
      });
  });
}

// Function to parse RSS XML and extract items
function parseRssFeed(xml) {
  console.log(`Parsing feed XML (${xml.length} bytes)`);
  console.log("XML sample:", xml.substring(0, 200) + "...");

  const items = [];
  const itemRegex =
    /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    let title = match[1].trim();
    let url = match[2].trim();

    // Clean up CDATA sections from title
    title = title.replace(/<!\[CDATA\[(.*?)\]\]>/, "$1");

    // Replace localhost URL with production URL
    if (url.includes("localhost:3000")) {
      url = url.replace("http://localhost:3000", productionUrl);
    }

    items.push({
      title: title,
      url: url,
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

  // Generate new content for the blog posts section with HTML anchor tags
  const postsList = posts
    .map((post, index) => {
      const listItem = `- <a href="${post.url}">${post.title}</a>`;
      // Add <br/> after each item except the last one
      return index < posts.length - 1 ? listItem + "\n<br/>" : listItem;
    })
    .join("\n");

  console.log("Generated posts list:");
  console.log(postsList);

  // Add newlines for readability
  const newContent = `<!-- BLOG-POST-LIST:START -->\n${postsList}\n<!-- BLOG-POST-LIST:END -->`;

  // Replace the section between markers
  const updatedContent = content.replace(
    /<!-- BLOG-POST-LIST:START -->[\s\S]*?<!-- BLOG-POST-LIST:END -->/,
    newContent
  );

  // Write the updated content back to the README
  fs.writeFileSync(readmePath, updatedContent);
  console.log(`✅ Updated README saved to: ${readmePath}`);

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
      process.exit(1);
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
      process.exit(0);
    } else {
      console.log("❌ Failed to update README");
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
