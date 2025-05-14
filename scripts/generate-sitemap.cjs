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
    // Ensure baseUrl ends without a trailing slash to prevent double slashes in URLs
    const baseUrl = (
      process.env.SITE_URL || "https://www.badger3000.com"
    ).replace(/\/$/, "");

    // Create the public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Query for content if Sanity client is available
    let items = [];

    if (!shouldUseFallback && client) {
      // Use the same query pattern as getPosts function
      const query = `*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) {
        _id,
        _type,
        title,
        "slug": coalesce(slug.current, "no-slug"),
        "publishedAt": coalesce(publishedAt, _createdAt),
        _updatedAt
      }`;

      try {
        // Add token to ensure authenticated access
        const token = process.env.SANITY_API_TOKEN;
        const clientConfig = token ? {token} : {};

        items = await client.fetch(query, {}, clientConfig);
        console.log(`Found ${items.length} content items for sitemap`);

        if (items.length > 0) {
          console.log(
            "Content types found:",
            items
              .map((item) => item._type)
              .filter((value, index, self) => self.indexOf(value) === index)
          );
          console.log(
            "First 3 items:",
            items.slice(0, 3).map((item) => `${item._type}/${item.slug}`)
          );
        } else {
          console.log("No content items found. Debugging connection...");

          // Try a simpler query to test connectivity
          const countQuery = `count(*[_type in ["articles", "codepen"] && !(_id in path('drafts.**'))])`;
          const totalCount = await client.fetch(countQuery, {}, clientConfig);
          console.log(`Total matching documents in dataset: ${totalCount}`);

          // Try an even simpler query
          const allDocsQuery = `count(*[!(_id in path('drafts.**'))])`;
          const allDocs = await client.fetch(allDocsQuery, {}, clientConfig);
          console.log(`Total documents of any type: ${allDocs}`);
        }
      } catch (err) {
        console.warn("Failed to fetch content items from Sanity:", err.message);
        console.log("Proceeding with empty item list for sitemap");
      }
    } else {
      console.log(
        "Using fallback mode - generating basic sitemap without content items"
      );
    }

    // Generate sitemap-0.xml (contains static routes) - with properly formatted namespaces
    let sitemap0 = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap0 +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
      '       xmlns:xhtml="http://www.w3.org/1999/xhtml"\n' +
      '       xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n' +
      '       xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n' +
      '       xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"\n' +
      '       xmlns:news="http://www.sitemaps.org/schemas/sitemap-news/0.9">\n';

    // Add home page - with better formatting
    sitemap0 += `  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Add static pages - with better formatting
    sitemap0 += `  <url>\n    <loc>${baseUrl}/articles</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    sitemap0 += `  <url>\n    <loc>${baseUrl}/codepen</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

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
