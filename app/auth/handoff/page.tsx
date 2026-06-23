'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { resolveAndStoreUserProfile } from '@/lib/auth-profile';
import { parseAuthHandoffHash, AUTH_HANDOFF_PATH } from '@/lib/auth-handoff';
import { setStoredToken } from '@/lib/auth-storage';
import { getLoginErrorMessage } from '@/lib/auth';

export default function AuthHandoffPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { token, remember, next } = parseAuthHandoffHash(
        window.location.hash,
      );

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        setStoredToken(token, remember);
        await resolveAndStoreUserProfile(token, remember);
        if (cancelled) return;
        window.history.replaceState(null, '', AUTH_HANDOFF_PATH);
        window.location.replace(next);
      } catch (err) {
        if (cancelled) return;
        setError(getLoginErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-accent hover:underline"
            onClick={() => router.replace('/login')}
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">Iniciando sesión…</p>
      </div>
    </div>
  );
}
