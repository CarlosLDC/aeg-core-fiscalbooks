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
  if (variant === 'menu') {
    return (
      <div>
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {sessionUser.name || sessionUser.email}
        </p>
        {sessionUser.name ? (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {sessionUser.email}
          </p>
        ) : null}
        {roleLabel ? (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {roleLabel}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 text-right">
      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
        {sessionUser.name || sessionUser.email}
      </p>
      {sessionUser.name || roleLabel ? (
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {sessionUser.name ? sessionUser.email : null}
          {sessionUser.name && roleLabel ? (
            <span className="text-slate-300 dark:text-slate-600"> · </span>
          ) : null}
          {roleLabel ? (
            <span className="font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {roleLabel}
            </span>
          ) : null}
        </p>
      ) : null}
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
    <div className="flex items-center gap-3">
      {sessionUser ? (
        <div className="hidden min-w-0 max-w-[10rem] sm:block md:max-w-xs">
          <SessionUserInfo
            sessionUser={sessionUser}
            roleLabel={roleLabel}
            variant="bar"
          />
        </div>
      ) : null}

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
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú"
        onClick={() => {
          if (!hoverCapable) setOpen((value) => !value);
        }}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 dark:active:bg-slate-800 sm:min-h-0 sm:min-w-0 sm:p-2"
      >
        <MenuIcon size={20} />
      </button>

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
    </div>
  );
}
