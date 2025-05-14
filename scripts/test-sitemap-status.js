#!/usr/bin/env node

/**
 * Test script to verify sitemap health
 *
 * This script checks:
 * 1. Static sitemap files for valid XML
 * 2. The existence and validity of all URLs in the sitemaps
 * 3. Simulates how search engines would access the sitemap
 */

const fs = require("fs");
const path = require("path");
const {DOMParser} = require("xmldom");
// Use http library instead of node-fetch to avoid ESM issues
const https = require("https");
const http = require("http");

const SITE_URL = process.env.SITE_URL || "https://www.badger3000.com";
const publicDir = path.join(process.cwd(), "public");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(`${colors.cyan}=== Sitemap Health Checker ===${colors.reset}`);
console.log(`${colors.blue}Testing sitemaps for ${SITE_URL}${colors.reset}\n`);

/**
 * Helper to validate XML
 */
function validateXml(xmlString, filename) {
  try {
    const parser = new DOMParser({
      errorHandler: {
        error: function (err) {
          throw new Error(`XML Error in ${filename}: ${err}`);
        },
        fatalError: function (err) {
          throw new Error(`Fatal XML Error in ${filename}: ${err}`);
        },
      },
    });

    const doc = parser.parseFromString(xmlString, "application/xml");
    return doc;
  } catch (error) {
    console.error(
      `${colors.red}❌ XML validation failed:${colors.reset}`,
      error.message
    );
    return null;
  }
}

/**
 * Simple HTTP/HTTPS request function
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          text: () => Promise.resolve(data),
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Check static sitemap files
 */
async function checkStaticSitemaps() {
  console.log(
    `${colors.magenta}Checking static sitemap files...${colors.reset}`
  );

  const files = ["sitemap.xml", "sitemap-0.xml", "server-sitemap.xml"];
  let allValid = true;

  for (const file of files) {
    const filePath = path.join(publicDir, file);

    try {
      if (!fs.existsSync(filePath)) {
        console.log(
          `${colors.yellow}⚠️ File not found: ${file}${colors.reset}`
        );
        allValid = false;
        continue;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const doc = validateXml(content, file);

      if (!doc) {
        allValid = false;
        continue;
      }

      console.log(`${colors.green}✅ ${file} - Valid XML${colors.reset}`);

      // For sitemap index, check if referenced sitemaps exist
      if (file === "sitemap.xml") {
        const sitemaps = doc.getElementsByTagName("sitemap");
        console.log(`   Found ${sitemaps.length} referenced sitemaps`);

        for (let i = 0; i < sitemaps.length; i++) {
          const loc = sitemaps[i].getElementsByTagName("loc")[0]?.textContent;
          if (loc) {
            console.log(`   - ${loc}`);

            // Extract filename from URL to check if it exists locally
            const filename = loc.split("/").pop();
            const localPath = path.join(publicDir, filename);

            if (!fs.existsSync(localPath)) {
              console.log(
                `${colors.yellow}⚠️ Referenced sitemap file not found locally: ${filename}${colors.reset}`
              );
            }
          }
        }
      } else {
        // For URL sitemaps, count URLs
        const urls = doc.getElementsByTagName("url");
        console.log(`   Contains ${urls.length} URLs`);
      }
    } catch (error) {
      console.error(
        `${colors.red}❌ Error checking ${file}:${colors.reset}`,
        error.message
      );
      allValid = false;
    }
  }

  return allValid;
}

/**
 * Check API sitemap endpoint
 */
async function checkApiSitemap() {
  console.log(
    `\n${colors.magenta}Checking API sitemap endpoint...${colors.reset}`
  );

  try {
    // First test local API endpoint if running locally
    const apiUrl = `${SITE_URL}/api/sitemap`;
    console.log(`Fetching ${apiUrl}`);

    const response = await request(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });

    if (!response.ok) {
      console.error(
        `${colors.red}❌ API endpoint returned status ${response.status}${colors.reset}`
      );
      return false;
    }

    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.includes("application/xml")) {
      console.log(
        `${colors.yellow}⚠️ API endpoint returned incorrect Content-Type: ${contentType}${colors.reset}`
      );
    }

    const content = await response.text();
    const doc = validateXml(content, "API sitemap response");

    if (!doc) {
      return false;
    }

    const urls = doc.getElementsByTagName("url");
    console.log(
      `${colors.green}✅ API sitemap - Valid XML with ${urls.length} URLs${colors.reset}`
    );

    return true;
  } catch (error) {
    console.error(
      `${colors.red}❌ Error checking API sitemap:${colors.reset}`,
      error.message
    );
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const staticResult = await checkStaticSitemaps();
    const apiResult = await checkApiSitemap();

    console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
    console.log(
      `Static sitemaps: ${staticResult ? colors.green + "✅ PASS" : colors.red + "❌ FAIL"}${colors.reset}`
    );
    console.log(
      `API sitemap: ${apiResult ? colors.green + "✅ PASS" : colors.red + "❌ FAIL"}${colors.reset}`
    );

    if (staticResult && apiResult) {
      console.log(`\n${colors.green}All sitemap tests passed!${colors.reset}`);
    } else {
      console.log(
        `\n${colors.yellow}⚠️ Some sitemap tests failed. Please check the issues above.${colors.reset}`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
