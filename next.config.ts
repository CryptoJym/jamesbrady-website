import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit rather than relying on the default (geo-seo-spec §3.2). Every
  // canonical, sitemap URL, llms.txt link and JSON-LD url is written without a
  // trailing slash; the site root is the only exception.
  trailingSlash: false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    return config;
  },
};

export default nextConfig;
