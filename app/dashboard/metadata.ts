import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Dashboard | BlogStack",
  description: "Manage your blog sites and content on BlogStack",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
}; 