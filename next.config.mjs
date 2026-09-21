// GitHub Pages serves a static bundle from a repository subpath and has no image optimizer,
// so that build target needs an export, a basePath and unoptimized images. Vercel and local
// dev use the default server build, which keeps the /api/mcp route.
const isGithubPages = process.env.GITHUB_PAGES === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGithubPages && {
    output: 'export',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
