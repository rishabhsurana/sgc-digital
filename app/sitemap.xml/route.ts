import { NextResponse } from "next/server"

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const now = new Date().toISOString()

  const routes = [
    "/",
    "/help",
    "/contact",
    "/sitemap",
    "/login",
    "/register",
    "/forgot-password",
    "/correspondence",
    "/contracts",
    "/dashboard",
    "/reports",
    "/management/login",
    "/management/register",
    "/management/landing",
  ]

  const urlset = routes
    .map((route) => {
      const priority = route === "/" ? "1.0" : "0.7"
      return [
        "<url>",
        `  <loc>${baseUrl}${route}</loc>`,
        `  <lastmod>${now}</lastmod>`,
        "  <changefreq>weekly</changefreq>",
        `  <priority>${priority}</priority>`,
        "</url>",
      ].join("\n")
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
