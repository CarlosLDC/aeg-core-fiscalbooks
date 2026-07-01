'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { SealResponse } from '@/types/seal';
import { SearchIcon } from '@/components/icons';
import { filterFiscalSeals, formatFiscalSealLabel } from '@/lib/fiscal-seal-select';

type FiscalSealSelectProps = {
  seals: SealResponse[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
};

export function FiscalSealSelect({
  seals,
  value,
  onChange,
  disabled = false,
  loading = false,
  placeholder = 'Seleccione un precinto disponible...',
}: FiscalSealSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const listId = useId();

  const selected = seals.find((seal) => String(seal.id) === value);
  const filtered = useMemo(() => filterFiscalSeals(seals, query), [seals, query]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const fieldClass =
    'w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:cursor-not-allowed disabled:opacity-60';

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      <button
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled || loading) return;
          setOpen((current) => !current);
        }}
        className={`${fieldClass} flex items-center justify-between gap-3`}
      >
        <span className={selected ? 'font-mono' : 'text-slate-400 dark:text-slate-500'}>
          {loading
            ? 'Cargando precintos disponibles...'
            : selected
              ? formatFiscalSealLabel(selected)
              : placeholder}
        </span>
        <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
          <div className="border-b border-slate-100 p-2 dark:border-slate-800">
            <label htmlFor={searchId} className="sr-only">
              Buscar precinto
            </label>
            <div className="relative">
              <input
                id={searchId}
                type="search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por serial o color..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon size={16} />
              </div>
            </div>
          </div>

          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto p-1.5"
          >
            {filtered.length > 0 ? (
              filtered.map((seal) => {
                const sealId = String(seal.id);
                const isSelected = sealId === value;
                return (
                  <li key={seal.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(sealId);
                        close();
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono">{formatFiscalSealLabel(seal)}</span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No hay precintos que coincidan con la búsqueda.
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
