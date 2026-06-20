export const DEFAULT_API_PATH_PREFIX = '/api';

const PRODUCTION_HOSTS = new Set([
  'aeg-core-admin.vercel.app',
  'aeg-libros-fiscales.vercel.app',
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
    process.env.NEXT_PUBLIC_AEG_CORE_API_URL?.trim() ||
    process.env.AEG_CORE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_UPSTREAM_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

function normalizePathPrefix(raw: string | null | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_API_PATH_PREFIX;
  if (value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

export function resolveApiPathPrefix(): string {
  return normalizePathPrefix(
    process.env.NEXT_PUBLIC_API_PATH_PREFIX ?? process.env.API_PATH_PREFIX,
  );
}

export function buildApiPath(path: string): string {
  const prefix = resolveApiPathPrefix();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (prefix === DEFAULT_API_PATH_PREFIX) {
    return normalizedPath;
  }

  if (
    normalizedPath === DEFAULT_API_PATH_PREFIX ||
    normalizedPath.startsWith(`${DEFAULT_API_PATH_PREFIX}/`)
  ) {
    return `${prefix}${normalizedPath.slice(DEFAULT_API_PATH_PREFIX.length)}` || '/';
  }

  return `${prefix}${normalizedPath}`;
}

export function resolveApiBaseUrl(): string | null {
  if (typeof window !== 'undefined' && shouldUseSameOriginApiProxy()) {
    return '';
  }

  const fromEnv = upstreamFromEnv();
  if (fromEnv) return fromEnv;

  return null;
}
