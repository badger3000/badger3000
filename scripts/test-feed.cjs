const https = require("https");
const fs = require("fs");

// Replace with the URL of your deployed site
const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const endpoint = `${url}/api/articles-feed`;

console.log(`Testing RSS feed at: ${endpoint}`);

// Make the HTTP request
const request = endpoint.startsWith("https") ? https : require("http");

request
  .get(endpoint, (res) => {
    let data = "";

    // A chunk of data has been received
    res.on("data", (chunk) => {
      data += chunk;
    });

    // The whole response has been received
    res.on("end", () => {
      console.log("RSS feed response received:");
      console.log("-".repeat(50));
      console.log(data.substring(0, 500) + "...");
      console.log("-".repeat(50));

      // Save the RSS feed to a file
      fs.writeFileSync("rss-feed.xml", data);
      console.log("Full RSS feed saved to rss-feed.xml");

      // Validate basic XML structure
      if (data.includes("<?xml") && data.includes("<rss")) {
        console.log("✅ XML structure looks valid");

        // Count items in the feed
        const itemCount = (data.match(/<item>/g) || []).length;
        console.log(`✅ Found ${itemCount} items in the feed`);

        if (itemCount > 0) {
          console.log(
            "✅ Feed contains articles and should work with the GitHub workflow"
          );
        } else {
          console.log(
            "⚠️ Feed contains no items - workflow may not update README"
          );
        }
      } else {
        console.log("❌ XML structure does not appear to be valid RSS");
      }
    });
  })
  .on("error", (err) => {
    console.error("Error testing RSS feed:", err.message);
  });
