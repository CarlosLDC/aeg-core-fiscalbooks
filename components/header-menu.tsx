'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLinkIcon,
  MenuIcon,
  MoonIcon,
  QrCodeIcon,
  SunIcon,
} from '@/components/icons';
import { ADMIN_APP_URL } from '@/components/admin-app-link';
import { userDisplayInitials, userDisplayName } from '@/lib/user-display';

type HeaderMenuProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  sessionUser: { email: string; name: string | null } | null;
  showAuthItems: boolean;
  roleLabel: string | null;
};

const menuItemClass =
  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800';

function SessionUserInfo({
  sessionUser,
  roleLabel,
  variant,
}: {
  sessionUser: { email: string; name: string | null };
  roleLabel: string | null;
  variant: 'bar' | 'menu';
}) {
  const displayName = userDisplayName(sessionUser.name, sessionUser.email);
  const initials = userDisplayInitials(sessionUser.name, sessionUser.email);

  if (variant === 'bar') {
    return (
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-semibold text-white shadow-sm"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="max-w-[7.5rem] truncate text-sm font-medium text-slate-900 dark:text-white md:max-w-[9.5rem]">
            {displayName}
          </p>
          {roleLabel ? (
            <p className="max-w-[7.5rem] truncate text-xs text-slate-500 dark:text-slate-400 md:max-w-[9.5rem]">
              {roleLabel}
            </p>
          ) : sessionUser.name ? (
            <p className="max-w-[7.5rem] truncate text-xs text-slate-500 dark:text-slate-400 md:max-w-[9.5rem]">
              {sessionUser.email}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-semibold text-white shadow-sm"
        aria-hidden
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {displayName}
        </p>
        {sessionUser.name ? (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {sessionUser.email}
          </p>
        ) : null}
        {roleLabel ? (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
        ) : null}
      </div>
    </div>
  );
}

function useHoverCapable(): boolean {
  const [hoverCapable, setHoverCapable] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setHoverCapable(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return hoverCapable;
}

export function HeaderMenu({
  theme,
  onToggleTheme,
  onLogout,
  sessionUser,
  showAuthItems,
  roleLabel,
}: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverCapable = useHoverCapable();

  useEffect(() => {
    if (!open || hoverCapable) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open, hoverCapable]);

  const panelClass = open
    ? 'pointer-events-auto visible opacity-100'
    : 'pointer-events-none invisible opacity-0';

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        if (hoverCapable) setOpen(true);
      }}
      onMouseLeave={() => {
        if (hoverCapable) setOpen(false);
      }}
    >
      <div className="flex items-center rounded-xl border border-slate-200/80 bg-white py-1 pl-1 pr-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:gap-1 sm:py-1 sm:pl-1.5 sm:pr-1.5">
        {sessionUser ? (
          <div className="hidden sm:block">
            <SessionUserInfo
              sessionUser={sessionUser}
              roleLabel={roleLabel}
              variant="bar"
            />
          </div>
        ) : null}

        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Menú"
          onClick={() => setOpen((value) => !value)}
          className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:active:bg-slate-800 sm:min-h-0 sm:min-w-0 ${
            sessionUser ? 'sm:ml-0.5 sm:border-l sm:border-slate-200/80 sm:pl-2 dark:sm:border-slate-800' : ''
          }`}
        >
          <MenuIcon size={18} />
        </button>
      </div>

      <div
        className={`absolute right-0 top-full z-50 w-[min(calc(100vw-3rem),16rem)] pt-2 transition-opacity duration-150 sm:w-64 ${panelClass}`}
      >
        <div
          role="menu"
          className="overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
        >
          {sessionUser ? (
            <div className="border-b border-slate-100 px-4 py-3 sm:hidden dark:border-slate-800">
              <SessionUserInfo
                sessionUser={sessionUser}
                roleLabel={roleLabel}
                variant="menu"
              />
            </div>
          ) : null}

          {showAuthItems ? (
            <>
              <a
                href={ADMIN_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={menuItemClass}
              >
                <ExternalLinkIcon size={16} className="shrink-0 text-slate-400" />
                <span className="flex-1">AEG Admin</span>
              </a>
              <Link
                href="/verify-qr"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={menuItemClass}
              >
                <QrCodeIcon size={16} className="shrink-0 text-slate-400" />
                <span className="flex-1">Ingresar código</span>
              </Link>
              <Link
                href="/manual"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={menuItemClass}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[11px] font-bold text-slate-400">
                  ?
                </span>
                <span className="flex-1">Manual</span>
              </Link>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            </>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onToggleTheme();
              if (!hoverCapable) setOpen(false);
            }}
            className={menuItemClass}
          >
            {theme === 'light' ? (
              <span className="shrink-0 text-slate-400">
                <MoonIcon size={16} />
              </span>
            ) : (
              <span className="shrink-0 text-slate-400">
                <SunIcon size={16} />
              </span>
            )}
            <span className="flex-1">
              {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            </span>
          </button>

          {sessionUser ? (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className={`${menuItemClass} text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300`}
              >
                <span className="flex-1">Salir</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
