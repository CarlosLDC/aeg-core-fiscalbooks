'use client';

import { useMemo, useState } from 'react';
import type { SealResponse } from '@/types/seal';
import { CheckIcon, ChevronDownIcon } from '@/components/icons';
import { SearchablePickerModal } from '@/components/searchable-picker-modal';
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

  const selected = seals.find((seal) => String(seal.id) === value);
  const trimmedQuery = query.trim();
  const filtered = useMemo(() => filterFiscalSeals(seals, query), [seals, query]);
  const totalMatches = useMemo(
    () => countFiscalSealMatches(seals, query),
    [seals, query],
  );
  const hasMoreMatches = totalMatches > FISCAL_SEAL_SEARCH_LIMIT;

  const fieldClass =
    'w-full max-w-md h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white disabled:cursor-not-allowed disabled:opacity-60';

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const openPicker = () => {
    if (disabled || loading) return;
    setQuery('');
    setOpen(true);
  };

  const pick = (sealId: string) => {
    onChange(sealId);
    close();
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled || loading}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPicker}
        className={`${fieldClass} flex items-center justify-between gap-3`}
      >
        <span className={selected ? 'font-mono' : 'text-slate-400 dark:text-slate-500'}>
          {loading
            ? 'Cargando precintos disponibles...'
            : selected
              ? formatFiscalSealLabel(selected)
              : placeholder}
        </span>
        <ChevronDownIcon size={16} className="shrink-0 text-slate-400" />
      </button>

      <SearchablePickerModal
        open={open}
        onClose={close}
        title="Seleccionar precinto"
        searchPlaceholder="Buscar por serial o color..."
        query={query}
        onQueryChange={setQuery}
      >
        <ul role="listbox" className="py-1">
          {!trimmedQuery ? (
            <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Escriba serial o color para buscar precintos disponibles.
            </li>
          ) : filtered.length > 0 ? (
            <>
              {filtered.map((seal) => {
                const sealId = String(seal.id);
                const isSelected = sealId === value;
                return (
                  <li key={seal.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => pick(sealId)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span
                        className={`truncate text-sm font-mono ${
                          isSelected
                            ? 'font-semibold text-blue-700 dark:text-blue-300'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {formatFiscalSealLabel(seal)}
                      </span>
                      {isSelected ? (
                        <CheckIcon size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
              {hasMoreMatches ? (
                <li className="px-4 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Mostrando los primeros {FISCAL_SEAL_SEARCH_LIMIT} de {totalMatches} resultados.
                </li>
              ) : null}
            </>
          ) : (
            <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No hay precintos que coincidan con la búsqueda.
            </li>
          )}
        </ul>
      </SearchablePickerModal>
    </>
  );
}
