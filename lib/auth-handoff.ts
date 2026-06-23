import { getSafeRedirectPath } from '@/lib/safe-redirect';

export const AUTH_HANDOFF_PATH = '/auth/handoff';

export function parseAuthHandoffHash(hash: string): {
  token: string | null;
  remember: boolean;
  next: string;
} {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    token: params.get('token'),
    remember: params.get('remember') === '1',
    next: getSafeRedirectPath(params.get('next')),
  };
}
