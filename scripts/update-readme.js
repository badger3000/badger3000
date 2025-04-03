#!/usr/bin/env node
const fs = require("fs");
const {exec} = require("child_process");
const path = require("path");

// Configuration
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const readmePath = path.join(process.cwd(), "README.md");
const maxPosts = 5;

console.log("🔄 Starting manual README update...");

// Function to execute a command and return output
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
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
      return `[${post.title}](${post.url})`;
    })
    .join("\n");

  console.log("Generated posts list:", postsList);

  // Add newlines for readability
  const newContent = `<!-- BLOG-POST-LIST:START -->\n${postsList}\n<!-- BLOG-POST-LIST:END -->`;

  // Replace the section between markers
  const updatedContent = content.replace(
    /<!-- BLOG-POST-LIST:START -->[\s\S]*?<!-- BLOG-POST-LIST:END -->/,
    newContent
  );

  // Show the difference
  console.log("Original content between markers:");
  const originalMatch = content.match(
    /<!-- BLOG-POST-LIST:START -->[\s\S]*?<!-- BLOG-POST-LIST:END -->/
  );
  console.log(originalMatch ? originalMatch[0] : "No match found");

  console.log("\nNew content between markers:");
  console.log(newContent);

  // Write the updated content back to the README
  fs.writeFileSync(readmePath, updatedContent);
  console.log(`✅ Updated README saved to: ${readmePath}`);

  return true;
}

// Main script
async function main() {
  try {
    // Create hard-coded posts for testing
    const testPosts = [
      {
        title: "How to Build a Next.js Application with Sanity",
        url: "https://example.com/articles/nextjs-sanity-guide",
      },
      {
        title: "Optimizing Performance in React Applications",
        url: "https://example.com/articles/react-performance-tips",
      },
    ];

    console.log("Using test posts for demonstration...");
    console.log(testPosts);

    // Update README with the test posts
    updateReadme(testPosts);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the script
main();
