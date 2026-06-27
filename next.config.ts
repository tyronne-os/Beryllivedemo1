import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "huggingface.co",
        pathname: "/datasets/AIBRUH/**",
      },
      {
        protocol: "https",
        hostname: "**.hf.space",
      },
    ],
  },
  output: "standalone",

  // Allow fetching from HuggingFace CDN and ZeroGPU spaces
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Tell browsers to prefetch HF CDN early
          {
            key: "Link",
            value: [
              '<https://huggingface.co>; rel=preconnect',
              '<https://cdn-lfs.huggingface.co>; rel=preconnect',
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
