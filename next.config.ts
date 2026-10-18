import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  // PGlite ships its own WASM build of Postgres; load it with plain Node require.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
