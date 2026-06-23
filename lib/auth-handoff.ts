import { getSafeRedirectPath } from '@/lib/safe-redirect';

export const AUTH_HANDOFF_PATH = '/auth/handoff';

function readHashParam(hash: string, key: string): string | null {
  const body = hash.replace(/^#/, '');
  if (!body) return null;

  const prefix = `${key}=`;
  for (const part of body.split('&')) {
    if (!part.startsWith(prefix)) continue;
    const raw = part.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

export function parseAuthHandoffHash(hash: string): {
  token: string | null;
  remember: boolean;
  next: string;
} {
  return {
    token: readHashParam(hash, 'token'),
    remember: readHashParam(hash, 'remember') === '1',
    next: getSafeRedirectPath(readHashParam(hash, 'next')),
  };
}
