/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "5r0rf2wc3u.ufs.sh",
        port: "",
      },
    ],
  },
};

export default nextConfig;