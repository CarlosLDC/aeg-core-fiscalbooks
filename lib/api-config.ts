export const DEFAULT_PRODUCTION_API_URL =
  'https://core-xgfvw.ondigitalocean.app';

const PRODUCTION_HOSTS = new Set([
  'aeg-core-admin.vercel.app',
  'aeg-admin.tech',
  'www.aeg-admin.tech',
]);

function isProductionHost(hostname: string): boolean {
  if (PRODUCTION_HOSTS.has(hostname)) return true;
  return hostname.endsWith('.vercel.app');
}

export function shouldUseSameOriginApiProxy(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API_PROXY === 'true') return true;
  if (typeof window !== 'undefined') {
    return isProductionHost(window.location.hostname);
  }
  return false;
}

function upstreamFromEnv(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_UPSTREAM_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

export function resolveApiBaseUrl(): string | null {
  if (typeof window !== 'undefined' && shouldUseSameOriginApiProxy()) {
    return '';
  }

  const fromEnv = upstreamFromEnv();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PRODUCTION_API_URL;
  }

  return null;
}
