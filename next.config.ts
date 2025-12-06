import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Disabled React Compiler for standalone version
  // reactCompiler: true,

  // Enable standalone output for Docker deployment
  output: 'standalone',

  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
