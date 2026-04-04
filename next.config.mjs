import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev())

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next from inferring the workspace root from lockfiles outside this repo.
  // (On Windows this can cause build tooling to behave unpredictably.)
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.thesportsdb.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
}

export default nextConfig
