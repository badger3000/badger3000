// Script to test sitemap files
const fs = require("fs");
const path = require("path");

function testSitemap() {
  try {
    console.log("Testing static sitemap files...");

    const publicDir = path.join(process.cwd(), "public");

    // Check if sitemap files exist
    const sitemapPath = path.join(publicDir, "sitemap.xml");
    const sitemap0Path = path.join(publicDir, "sitemap-0.xml");
    const serverSitemapPath = path.join(publicDir, "server-sitemap.xml");

    console.log(`Checking sitemap files in: ${publicDir}`);
    console.log(
      `Main sitemap index: ${fs.existsSync(sitemapPath) ? "✅ Exists" : "❌ Missing"}`
    );
    console.log(
      `Static routes sitemap: ${fs.existsSync(sitemap0Path) ? "✅ Exists" : "❌ Missing"}`
    );
    console.log(
      `Server sitemap: ${fs.existsSync(serverSitemapPath) ? "✅ Exists" : "❌ Missing"}`
    );

    // Read and analyze static sitemap content
    if (fs.existsSync(sitemap0Path)) {
      const sitemap0Content = fs.readFileSync(sitemap0Path, "utf8");
      console.log("\nStatic routes sitemap content sample:");
      console.log(sitemap0Content.substring(0, 500) + "...");

      // Count how many URLs are in the sitemap
      const urlCount = (sitemap0Content.match(/<url>/g) || []).length;
      console.log(`Found ${urlCount} URLs in the static routes sitemap`);

      // Check for home, articles, and codepen pages
      const hasHome = sitemap0Content.includes(
        "https://www.badger3000.com</loc>"
      );
      const hasArticles = sitemap0Content.includes("/articles</loc>");
      const hasCodepen = sitemap0Content.includes("/codepen</loc>");

      console.log("Contains home page:", hasHome);
      console.log("Contains articles page:", hasArticles);
      console.log("Contains codepen page:", hasCodepen);
    }

    // Read and analyze server sitemap content
    if (fs.existsSync(serverSitemapPath)) {
      const serverSitemapContent = fs.readFileSync(serverSitemapPath, "utf8");
      console.log("\nServer sitemap content sample:");
      console.log(serverSitemapContent.substring(0, 500) + "...");

      // Count how many URLs are in the sitemap
      const urlCount = (serverSitemapContent.match(/<url>/g) || []).length;
      console.log(`Found ${urlCount} URLs in the server sitemap`);

      // Check for individual article and codepen pages
      const hasArticleItems = serverSitemapContent.includes("/articles/");
      const hasCodepenItems = serverSitemapContent.includes("/codepen/");

      console.log("Contains individual article pages:", hasArticleItems);
      console.log("Contains individual codepen pages:", hasCodepenItems);
    }

    console.log("\nSitemap testing complete!");
  } catch (error) {
    console.error("Error testing sitemap:", error);
  }
}

testSitemap();
