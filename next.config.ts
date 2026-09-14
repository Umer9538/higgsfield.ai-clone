import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The live site reaches these sections at deeper paths; keep them working.
    return [
      { source: "/original-series", destination: "/originals", permanent: false },
      { source: "/plugins/after-effects", destination: "/plugins", permanent: false },
      {
        source: "/contests/higgsfield-global-film-festival",
        destination: "/contests",
        permanent: false,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
