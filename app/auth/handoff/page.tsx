'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  establishSessionFromHandoff,
  getLoginErrorMessage,
} from '@/lib/auth';
import { parseAuthHandoffHash, AUTH_HANDOFF_PATH } from '@/lib/auth-handoff';

export default function AuthHandoffPage() {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const { token, remember, next } = parseAuthHandoffHash(window.location.hash);
    if (!token) {
      window.location.replace('/login');
      return;
    }

    void establishSessionFromHandoff(token, remember)
      .then(() => {
        window.history.replaceState(null, '', AUTH_HANDOFF_PATH);
        window.location.replace(next);
      })
      .catch((err) => {
        setError(getLoginErrorMessage(err));
      });
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-accent hover:underline"
            onClick={() => {
              window.location.replace('/login');
            }}
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
