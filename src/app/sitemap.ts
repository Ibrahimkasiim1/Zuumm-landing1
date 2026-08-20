import type { MetadataRoute } from "next";

const base = "https://www.zuumm.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }];
}
