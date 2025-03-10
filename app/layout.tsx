import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@uploadthing/react/styles.css";
import "./globals.css";

import { ThemeProvider } from "./components/dashboard/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
  fallback: ["monospace"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "BlogStack",
    template: "%s | BlogStack",
  },
  description: "A modern platform for creating and managing multiple blogs",
  keywords: ["blog", "blogging", "multi-tenant", "content management", "writing platform"],
  authors: [{ name: "BlogStack Team" }],
  creator: "BlogStack",
  publisher: "BlogStack",
  metadataBase: new URL("https://blogstack.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blogstack.io",
    title: "BlogStack - Multi-tenant Blogging Platform",
    description: "A modern, elegant blogging platform for creators and businesses",
    siteName: "BlogStack",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogStack - Multi-tenant Blogging Platform",
    description: "A modern, elegant blogging platform for creators and businesses",
    creator: "@blogstack",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/globe.svg",
    apple: "/globe.svg"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="custom-scrollbar">
      <head>
        <link rel="icon" href="/globe.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/globe.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="animate-in flex-grow">
            {children}
          </div>
          <Toaster richColors closeButton position="bottom-right" />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}