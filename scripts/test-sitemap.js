// Script to test sitemap generation
import fetch from "node-fetch";

async function testSitemap() {
  try {
    console.log("Testing sitemap generation...");

    // Test the API sitemap route
    const apiSitemapUrl = "http://localhost:3000/api/sitemap";
    console.log(`Testing API sitemap route: ${apiSitemapUrl}`);

    const apiResponse = await fetch(apiSitemapUrl);

    if (!apiResponse.ok) {
      throw new Error(
        `API sitemap request failed with status: ${apiResponse.status}`
      );
    }

    const apiSitemapContent = await apiResponse.text();
    console.log("API Sitemap content sample:");
    console.log(apiSitemapContent.substring(0, 500) + "...");

    // Count how many URLs are in the sitemap
    const urlCount = (apiSitemapContent.match(/<url>/g) || []).length;
    console.log(`Found ${urlCount} URLs in the API sitemap`);

    // Check for specific page types
    const hasArticles = apiSitemapContent.includes("/articles/");
    const hasCodepen = apiSitemapContent.includes("/codepen/");

    console.log("Contains article pages:", hasArticles);
    console.log("Contains codepen pages:", hasCodepen);

    console.log("\nSitemap testing complete!");

    if (urlCount > 3 && hasArticles && hasCodepen) {
      console.log(
        "✅ Sitemap looks good. Both article and codepen pages are included."
      );
    } else {
      console.log(
        "⚠️ Sitemap may have issues. Check the content to ensure all pages are included."
      );
    }
  } catch (error) {
    console.error("Error testing sitemap:", error);
  }
}

testSitemap();
