// Script to ensure sitemaps are properly generated before deployment
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const {createClient} = require("next-sanity");

// Load environment variables from .env files
dotenv.config({path: ".env.local"});
dotenv.config();

// Get Sanity credentials from environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

console.log("Environment check:");
console.log(
  "- SITE_URL:",
  process.env.SITE_URL || "https://www.badger3000.com/"
);
console.log(
  "- NEXT_PUBLIC_SANITY_PROJECT_ID:",
  projectId ? "✅ Found" : "❌ Missing"
);
console.log(
  "- NEXT_PUBLIC_SANITY_DATASET:",
  dataset ? "✅ Found" : "❌ Missing"
);

// Prepare for possible fallback
let shouldUseFallback = false;

// Validate Sanity credentials
if (!projectId) {
  console.error(
    "Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not defined in environment variables"
  );
  console.log("Proceeding with fallback sitemap generation...");
  shouldUseFallback = true;
}

if (!dataset) {
  console.error(
    "Error: NEXT_PUBLIC_SANITY_DATASET is not defined in environment variables"
  );
  console.log("Proceeding with fallback sitemap generation...");
  shouldUseFallback = true;
}

// Configure Sanity client only if credentials are available
const client = !shouldUseFallback
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2021-10-21",
      useCdn: false,
    })
  : null;

// Generate a fallback sitemap XML
async function generateSitemapXml() {
  try {
    console.log("Generating sitemap XML files...");
    const baseUrl = process.env.SITE_URL || "https://www.badger3000.com/";

    // Create the public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Query for content if Sanity client is available
    let items = [];

    if (!shouldUseFallback && client) {
      const query = `*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) {
        _type,
        "slug": slug.current,
        _updatedAt
      }`;

      try {
        items = await client.fetch(query);
        console.log(`Found ${items.length} content items for sitemap`);
      } catch (err) {
        console.warn("Failed to fetch content items from Sanity:", err.message);
        console.log("Proceeding with empty item list for sitemap");
      }
    } else {
      console.log(
        "Using fallback mode - generating basic sitemap without content items"
      );
    }

    // Generate sitemap-0.xml (contains static routes)
    let sitemap0 = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap0 +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add home page
    sitemap0 += `<url><loc>${baseUrl}</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;

    // Add static pages
    sitemap0 += `<url><loc>${baseUrl}/articles</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;
    sitemap0 += `<url><loc>${baseUrl}/codepen</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;

    sitemap0 += "</urlset>";

    // Generate server-sitemap.xml (will be generated at runtime, but create a placeholder)
    let serverSitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    serverSitemap +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add content items
    if (items && items.length > 0) {
      items.forEach((item) => {
        const sectionPath = item._type === "articles" ? "articles" : "codepen";
        serverSitemap += `<url>
    <loc>${baseUrl}/${sectionPath}/${item.slug}</loc>
    <lastmod>${new Date(item._updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      });
    }

    serverSitemap += "</urlset>";

    // Generate main sitemap index
    let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapIndex +=
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    sitemapIndex += `<sitemap><loc>${baseUrl}/sitemap-0.xml</loc></sitemap>\n`;
    sitemapIndex += `<sitemap><loc>${baseUrl}/server-sitemap.xml</loc></sitemap>\n`;
    sitemapIndex += "</sitemapindex>";

    // Write files
    fs.writeFileSync(path.join(publicDir, "sitemap-0.xml"), sitemap0);
    fs.writeFileSync(path.join(publicDir, "server-sitemap.xml"), serverSitemap);
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapIndex);

    console.log("Sitemap files generated successfully:");
    console.log("- sitemap.xml (index)");
    console.log("- sitemap-0.xml (static routes)");
    console.log("- server-sitemap.xml (dynamic content)");
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
}

// Run the generator and catch any errors at the top level
generateSitemapXml().catch((error) => {
  console.error("Fatal error in sitemap generation:", error);
  console.log("Generation failed, but build process will continue.");
  // Don't exit with error code - allow build to continue
});
