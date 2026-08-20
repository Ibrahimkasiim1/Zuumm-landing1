import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/get-started"] }],
    sitemap: "https://www.zuumm.ai/sitemap.xml",
  };
}
