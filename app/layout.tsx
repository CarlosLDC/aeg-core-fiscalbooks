'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout as authLogout } from '@/lib/auth';
import {
  refreshUserProfileFromApi,
  type UserProfile as AuthUserProfile,
} from '@/lib/auth-profile';
import { profileToPerfilApp, rolUsuarioLabel, type PerfilApp } from '@/lib/roles';
import { HeaderMenu } from '@/components/header-menu';
import { InactivitySessionModal } from '@/components/inactivity-session-modal';

const inter = Inter({ subsets: ['latin'] });

export type UserProfile = PerfilApp;

export const UserProfileContext = createContext<{
  sessionUser: { email: string; name: string | null } | null;
  profile: UserProfile | null;
  authProfile: AuthUserProfile | null;
  loading: boolean;
  distributorId: number | null;
}>({
  sessionUser: null,
  profile: null,
  authProfile: null,
  loading: true,
  distributorId: null,
});

export function useUserProfile() {
  return useContext(UserProfileContext);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionUser, setSessionUser] = useState<{
    email: string;
    name: string | null;
  } | null>(null);
  const [authProfile, setAuthProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark' | null) || 'light';
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [distributorId, setDistributorId] = useState<number | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isLoginPath = pathname === '/login' || pathname?.startsWith('/login/');
  const isAuthHandoffPath =
    pathname === '/auth/handoff' || pathname?.startsWith('/auth/handoff/');
  const isPublicAuthPath = isLoginPath || isAuthHandoffPath;
  const showManualLink = !!profile?.rol_usuario;
  const roleLabel = rolUsuarioLabel(profile?.rol_usuario);

  useEffect(() => {
    const applyTheme = (t: 'light' | 'dark') => {
      const root = document.documentElement;
      if (t === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.title = 'Libros Fiscales - AEG';
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      if (isAuthHandoffPath) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const session = getSession();
      if (!session) {
        if (!cancelled) {
          setSessionUser(null);
          setAuthProfile(null);
          setProfile(null);
          setDistributorId(null);
          setLoading(false);
        }
        return;
      }

      let resolved = session;
      try {
        const refreshed = await refreshUserProfileFromApi(
          session.username,
          session.token,
        );
        if (refreshed) resolved = { token: session.token, ...refreshed };
      } catch {
        /* usar perfil en caché */
      }

      if (cancelled) return;

      setSessionUser({
        email: resolved.email,
        name: resolved.name,
      });
      setAuthProfile(resolved);
      setProfile(profileToPerfilApp(resolved));
      setDistributorId(resolved.distributorId ?? null);
      setLoading(false);
    };

    syncSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, isAuthHandoffPath]);

  useEffect(() => {
    if (loading) return;

    const hasStoredSession = Boolean(getSession());

    if (!sessionUser && !isPublicAuthPath && !hasStoredSession) {
      router.push('/login');
    } else if (sessionUser && isLoginPath) {
      router.push('/');
    }
  }, [sessionUser, loading, isLoginPath, isPublicAuthPath, router]);

  const cycleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    const root = document.documentElement;
    if (nextTheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  };

  const handleLogout = () => {
    setSessionUser(null);
    setAuthProfile(null);
    setProfile(null);
    setDistributorId(null);
    setLoading(false);
    authLogout();
    window.location.href = '/login';
  };

  return (
    <html lang="es" className="transition-colors duration-300">
      <body className={`${inter.className} bg-background text-foreground`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-50 backdrop-blur-xl transition-colors">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/aeg-logo.png" alt="AEG Logo" className="h-10 w-auto logo-theme-aware" />
              </Link>

              <HeaderMenu
                theme={theme}
                onToggleTheme={cycleTheme}
                onLogout={handleLogout}
                sessionUser={sessionUser}
                showAuthItems={Boolean(sessionUser && showManualLink)}
                roleLabel={roleLabel}
              />
            </div>
          </header>

          <div className="flex-1 w-full flex flex-col">
            <UserProfileContext.Provider
              value={{ sessionUser, profile, authProfile, loading, distributorId }}
            >
              {loading && !isPublicAuthPath ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-pulse text-muted font-medium">Cargando sesión...</div>
                </div>
              ) : (
                children
              )}
            </UserProfileContext.Provider>
          </div>

          <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60 py-8 mt-auto transition-colors">
            <div className="container mx-auto px-6 text-center text-muted text-xs">
              <p>&copy; {new Date().getFullYear()} AEG. Todos los derechos reservados.</p>
            </div>
          </footer>

          <InactivitySessionModal
            enabled={Boolean(sessionUser) && !isPublicAuthPath && !loading}
            onExpire={handleLogout}
          />
        </div>
      </body>
    </html>
  );
}
