import { withWhopAppConfig } from "@whop/react/next";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Explicitly prefer Node.js runtime for server actions/API routes where possible
    // though app/api/layout.tsx should handle the specific API routes.
  },
};

export default withWhopAppConfig(nextConfig);
