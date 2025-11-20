/** TEMPORARY DEBUG: removed withWhopAppConfig wrapper to test runtime override */
const nextConfig = {
  // keep any small flags you actually need — keep this minimal for the test
  experimental: {
    optimizePackageImports: true,
    serverActions: true,
  },
};

export default nextConfig;
