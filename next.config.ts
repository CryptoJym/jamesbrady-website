import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit rather than relying on the default (geo-seo-spec §3.2). Every
  // canonical, sitemap URL, llms.txt link and JSON-LD url is written without a
  // trailing slash; the site root is the only exception.
  trailingSlash: false,
  // Two retired routes, 2026-09-27. Both are permanent (308), so search engines
  // move their links to the new address. Exact paths only: nothing under
  // /.well-known, /learn or /about can match either rule.
  async redirects() {
    return [
      // The recordings say a framing the site has retired, out loud. Their
      // written archive stays at /learn.
      { source: "/watch", destination: "/learn", permanent: true },
      // The profiles and ways in now live on the about page.
      { source: "/links", destination: "/about#elsewhere", permanent: true },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    return config;
  },
};

export default nextConfig;
