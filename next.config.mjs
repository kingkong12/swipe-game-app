/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Output configuration for different deployments
  // For Vercel: 'standalone' (default)
  // For Cloudflare: we'll use @cloudflare/next-on-pages
  
  // Allow images from external sources
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
