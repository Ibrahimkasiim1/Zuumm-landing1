import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Next 16 only serves qualities listed here (default: [75]). 90 is for
       the small mosaic tiles, where compression artefacts would show. */
    qualities: [75, 90],
  },
};

export default nextConfig;
