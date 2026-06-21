import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const SITE_URL = process.env.SITE_URL || "https://meika-and-co.example"; // set real domain in CI

function buildSitemap(products) {
  const pages = [
    { url: "", priority: 1.0 },
    { url: "products", priority: 0.9 },
    { url: "contact", priority: 0.8 },
  ];

  const urls = pages
    .map((p) => {
      return `  <url>\n    <loc>${SITE_URL}/${p.url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`;
    })
    .join("\n");

  const productUrls = products
    .map((prod) => {
      return `  <url>\n    <loc>${SITE_URL}/products/${prod.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n${productUrls}\n</urlset>`;
}

async function main() {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "products.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const products = JSON.parse(raw);

    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR);
    }

    const sitemap = buildSitemap(products);
    fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf-8");

    // update robots to include sitemap location
    const robots = `User-agent: *\nDisallow:\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
    fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robots, "utf-8");

    console.log("Sitemap and robots.txt generated in public/");
  } catch (err) {
    console.error("Error generating sitemap:", err);
    process.exit(1);
  }
}

void main();
