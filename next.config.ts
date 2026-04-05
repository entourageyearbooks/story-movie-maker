import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk", "@aws-sdk/client-s3"],
};

export default nextConfig;
