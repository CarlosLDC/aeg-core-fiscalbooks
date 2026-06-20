import type { NextConfig } from 'next';

const DEFAULT_API_UPSTREAM = 'https://core-xgfvw.ondigitalocean.app';
const DEFAULT_API_PATH_PREFIX = '/api';

function normalizePathPrefix(raw: string | null | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_API_PATH_PREFIX;
  if (value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

const apiUpstream =
  process.env.AEG_CORE_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_AEG_CORE_API_URL?.trim() ||
  process.env.API_UPSTREAM_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  DEFAULT_API_UPSTREAM;

const publicApiPathPrefix = normalizePathPrefix(
  process.env.NEXT_PUBLIC_API_PATH_PREFIX ?? process.env.API_PATH_PREFIX,
);
const upstreamApiPathPrefix = normalizePathPrefix(
  process.env.API_UPSTREAM_PATH_PREFIX ??
    process.env.NEXT_PUBLIC_API_PATH_PREFIX ??
    process.env.API_PATH_PREFIX,
);
const publicRewriteSource = publicApiPathPrefix
  ? `${publicApiPathPrefix}/:path*`
  : '/:path*';
const upstreamRewriteDestination = upstreamApiPathPrefix
  ? `${upstreamApiPathPrefix}/:path*`
  : '/:path*';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_USE_API_PROXY:
      process.env.NEXT_PUBLIC_USE_API_PROXY ??
      (process.env.VERCEL ? 'true' : 'false'),
    NEXT_PUBLIC_API_PATH_PREFIX: publicApiPathPrefix,
  },
  async rewrites() {
    const upstream = apiUpstream.replace(/\/$/, '');
    return {
      fallback: [
        {
          source: publicRewriteSource,
          destination: `${upstream}${upstreamRewriteDestination}`,
        },
      ],
    };
  },
};

export default nextConfig;
