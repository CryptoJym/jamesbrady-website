import type { MetadataRoute } from "next";

const baseUrl = "https://www.jamesbrady.org";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/primer`, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${baseUrl}/manuscript`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workshop`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${baseUrl}/watch`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/links`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.8 },
  ];
}
