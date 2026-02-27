/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/icons/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.120",
        port: "8000",
        pathname: "/icons/**",
      },
    ],
  },
};

export default nextConfig;
