/** @type {import('next').NextConfig} */
const nextConfig = {
  // In dev, do not change!!
  //   output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "161.132.47.226",
        port: "3000",
        pathname: "/**",
      },
      // If you need to add your backend URL (assuming it's different)
      // {
      //   protocol: 'http',
      //   hostname: 'your-backend-domain.com',
      //   port: '',
      //   pathname: '/uploads/**',
      // },
    ],
  },
};

export default nextConfig;
