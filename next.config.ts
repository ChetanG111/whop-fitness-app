import type { NextConfig } from "next";
import { withWhopAppConfig } from "@whop/react/next.config";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withWhopAppConfig(nextConfig);
