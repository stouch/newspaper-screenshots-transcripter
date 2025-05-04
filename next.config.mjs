/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*'], // Allow images from any domain (needed for S3)
  },
  reactStrictMode: false
};

export default nextConfig; 