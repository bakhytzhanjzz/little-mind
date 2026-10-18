import type { Metadata, Viewport } from "next";
import { Figtree, Shantell_Sans } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const shantell = Shantell_Sans({
  variable: "--font-shantell",
  subsets: ["latin"],
  axes: ["BNCE", "INFM"],
});

export const metadata: Metadata = {
  title: "Little Mind+",
  description: "A two-minute daily mood check-in for kids, with a calm history for parents.",
  applicationName: "Little Mind+",
  appleWebApp: { capable: true, title: "Little Mind", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f3f7" },
    { media: "(prefers-color-scheme: dark)", color: "#16182a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${shantell.variable} antialiased`}>
      <body className="font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
