'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { SealResponse } from '@/types/seal';
import { SearchIcon } from '@/components/icons';
import {
  FISCAL_SEAL_SEARCH_LIMIT,
  countFiscalSealMatches,
  filterFiscalSeals,
  formatFiscalSealLabel,
} from '@/lib/fiscal-seal-select';

type FiscalSealSelectProps = {
  seals: SealResponse[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
};

const DROPDOWN_ESTIMATED_HEIGHT_PX = 320;

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
  const [openUpward, setOpenUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const listId = useId();

  const selected = seals.find((seal) => String(seal.id) === value);
  const trimmedQuery = query.trim();
  const filtered = useMemo(() => filterFiscalSeals(seals, query), [seals, query]);
  const totalMatches = useMemo(
    () => countFiscalSealMatches(seals, query),
    [seals, query],
  );
  const hasMoreMatches = totalMatches > FISCAL_SEAL_SEARCH_LIMIT;

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

  useEffect(() => {
    if (!open) return;

    const updatePlacement = () => {
      const trigger = rootRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const panelHeight = panelRef.current?.offsetHeight ?? DROPDOWN_ESTIMATED_HEIGHT_PX;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < panelHeight && spaceAbove > spaceBelow);
    };

    updatePlacement();
    const frame = window.requestAnimationFrame(updatePlacement);
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open, query, filtered.length, hasMoreMatches]);

  const fieldClass =
    'w-full max-w-md h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:cursor-not-allowed disabled:opacity-60';

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
        <div
          ref={panelRef}
          className={`absolute z-30 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30 ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
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

          <ul id={listId} role="listbox" className="max-h-56 overflow-y-auto p-1.5">
            {!trimmedQuery ? (
              <li className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                Escriba serial o color para buscar precintos disponibles.
              </li>
            ) : filtered.length > 0 ? (
              <>
                {filtered.map((seal) => {
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
                })}
                {hasMoreMatches ? (
                  <li className="px-3 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    Mostrando los primeros {FISCAL_SEAL_SEARCH_LIMIT} de {totalMatches} resultados.
                  </li>
                ) : null}
              </>
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
