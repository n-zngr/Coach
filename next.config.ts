import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true, // Allow builds even with TypeScript errors
    },    
};

export default nextConfig;
