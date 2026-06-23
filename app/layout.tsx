'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SunIcon, MoonIcon } from '@/components/icons';
import { getSession, logout as authLogout } from '@/lib/auth';
import {
  refreshUserProfileFromApi,
  type UserProfile as AuthUserProfile,
} from '@/lib/auth-profile';
import { profileToPerfilApp, rolUsuarioLabel, type PerfilApp } from '@/lib/roles';
import { AdminAppLink } from '@/components/admin-app-link';

const inter = Inter({ subsets: ['latin'] });

export type UserProfile = PerfilApp;

export const UserProfileContext = createContext<{
  sessionUser: { email: string; name: string | null } | null;
  profile: UserProfile | null;
  authProfile: AuthUserProfile | null;
  loading: boolean;
  tecnicoDistribuidoraId: number | null;
}>({
  sessionUser: null,
  profile: null,
  authProfile: null,
  loading: true,
  tecnicoDistribuidoraId: null,
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
  const [tecnicoDistribuidoraId, setTecnicoDistribuidoraId] = useState<number | null>(null);

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
      setLoading(true);
      const session = getSession();
      if (!session) {
        if (!cancelled) {
          setSessionUser(null);
          setAuthProfile(null);
          setProfile(null);
          setTecnicoDistribuidoraId(null);
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
      setTecnicoDistribuidoraId(resolved.distributorId ?? null);
      setLoading(false);
    };

    syncSession();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

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
    setTecnicoDistribuidoraId(null);
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
              <div className="flex items-center gap-3 md:gap-4">
                <Link href="/" className="flex items-center gap-3 group">
                  <img src="/aeg-logo.png" alt="AEG Logo" className="h-10 w-auto logo-theme-aware" />
                </Link>
                <AdminAppLink />
                {sessionUser && showManualLink && (
                  <Link
                    href="/manual"
                    className="inline-flex items-center px-2 py-1 md:px-2.5 rounded-md text-[11px] md:text-sm font-medium text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                  >
                    Manual
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={cycleTheme}
                  className="p-2.5 rounded-xl text-muted hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900"
                  title={`Tema: ${theme === 'dark' ? 'Oscuro' : 'Claro'}`}
                >
                  {theme === 'light' && <MoonIcon size={18} />}
                  {theme === 'dark' && <SunIcon size={18} />}
                </button>

                {sessionUser && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    {roleLabel && (
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 rounded-md px-1.5 py-0.5 sm:px-2">
                        {roleLabel}
                      </span>
                    )}
                    <span className="text-muted text-xs md:text-sm max-w-[100px] md:max-w-none truncate">
                      {sessionUser.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all border border-slate-200 dark:border-slate-800"
                    >
                      Salir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 w-full flex flex-col">
            <UserProfileContext.Provider
              value={{ sessionUser, profile, authProfile, loading, tecnicoDistribuidoraId }}
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
        </div>
      </body>
    </html>
  );
}
