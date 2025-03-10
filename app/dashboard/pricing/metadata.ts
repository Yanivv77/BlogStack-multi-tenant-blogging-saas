import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pricing | BlogStack",
  description: "View pricing plans for BlogStack",
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