'use client';

import { useEffect, useId, useRef, useState } from 'react';
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
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800';

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
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <MenuIcon size={18} />
        <span className="hidden sm:inline">Menú</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
        >
          {sessionUser ? (
            <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
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
          ) : null}

          {showAuthItems ? (
            <>
              <a
                href={ADMIN_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={close}
                className={menuItemClass}
              >
                <ExternalLinkIcon size={16} className="shrink-0 text-slate-400" />
                <span className="flex-1">AEG Admin</span>
              </a>
              <Link
                href="/verify-qr"
                role="menuitem"
                onClick={close}
                className={menuItemClass}
              >
                <QrCodeIcon size={16} className="shrink-0 text-slate-400" />
                <span className="flex-1">Ingresar código</span>
              </Link>
              <Link href="/manual" role="menuitem" onClick={close} className={menuItemClass}>
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
              close();
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
                  close();
                  onLogout();
                }}
                className={`${menuItemClass} text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300`}
              >
                <span className="flex-1">Salir</span>
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
