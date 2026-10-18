import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Little Mind+",
    short_name: "Little Mind",
    description: "A two-minute daily mood check-in for kids, with a calm history for parents.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f3f7",
    theme_color: "#f2f3f7",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
