'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiscalPrinter } from '@/lib/types';
import { printerService } from '@/lib/printer-service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/app/layout';
import { NoData } from '@/components/no-data';
import { SearchIcon, ArrowRight } from '@/components/icons';
import { printerEstatusBadgeClass, printerEstatusLabel, type PrinterListingFilter } from '@/lib/printer-status';
import { MIN_PARTIAL_SEARCH_LENGTH } from '@/lib/fiscal-book-search';
import {
  saveSearchReturnState,
  shouldRestoreSearchFromUrl,
  loadSearchReturnState,
} from '@/lib/search-return-state';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
const PAGE_SIZE_STORAGE_KEY = 'aeg-search-page-size';
const LISTING_FILTER_OPTIONS: { value: PrinterListingFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'activa', label: 'Activas' },
  { value: 'retirada', label: 'Retiradas' },
];
/** Altura aproximada del header sticky + margen para scroll manual */
const SCROLL_HEADER_OFFSET_PX = 88;

function readStoredPageSize(): number {
  if (typeof window === 'undefined') return 5;
  try {
    const raw = localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
    const n = raw != null ? Number(raw) : NaN;
    if (PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number])) {
      return n;
    }
  } catch {
    /* ignore */
  }
  return 5;
}

function scrollResultsSectionIntoView(resultsEl: HTMLElement | null) {
  if (!resultsEl || typeof window === 'undefined') return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const rect = resultsEl.getBoundingClientRect();
      const top = rect.top + window.scrollY - SCROLL_HEADER_OFFSET_PX;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
}

export default function SearchPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useUserProfile();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'serial' | 'rif'>('serial');
  // Tipo realmente usado en la última búsqueda (no cambia si solo tocas el selector)
  const [searchedType, setSearchedType] = useState<'serial' | 'rif'>('serial');
  const [results, setResults] = useState<FiscalPrinter[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pagination & Scrolling
  const resultsRef = useRef<HTMLDivElement>(null);
  const pendingScrollToResults = useRef(false);
  const pendingScrollY = useRef<number | null>(null);
  const restoreStartedRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [listingFilter, setListingFilter] = useState<PrinterListingFilter>('all');

  useEffect(() => {
    setPageSize(readStoredPageSize());
  }, []);

  const persistPageSize = useCallback((n: number) => {
    setPageSize(n);
    try {
      localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(n));
    } catch {
      /* ignore */
    }
  }, []);

  /** Tras terminar una carga, el DOM ya refleja los resultados: entonces hacemos scroll. */
  useEffect(() => {
    if (loading || !pendingScrollToResults.current) return;
    pendingScrollToResults.current = false;
    scrollResultsSectionIntoView(resultsRef.current);
  }, [loading, hasSearched, results.length]);

  // Search Normalization
  const handleSearchTermChange = (value: string) => {
    // Uppercase + alphanumeric only
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSearchTerm(normalized);
  };

  useEffect(() => {
    if (loading || pendingScrollToResults.current) return;
    if (pendingScrollY.current == null) return;
    const y = pendingScrollY.current;
    pendingScrollY.current = null;
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }, [loading, hasSearched, results.length]);

  const persistSearchReturn = useCallback(
    (input: {
      term: string;
      searched: 'serial' | 'rif';
      selector: 'serial' | 'rif';
      page: number;
      size: number;
      filter: PrinterListingFilter;
      scrollY?: number;
    }) => {
      saveSearchReturnState({
        active: true,
        searchTerm: input.term,
        searchType: input.selector,
        searchedType: input.searched,
        currentPage: input.page,
        pageSize: input.size,
        listingFilter: input.filter,
        scrollY:
          input.scrollY ??
          (typeof window !== 'undefined' ? window.scrollY : 0),
      });
    },
    [],
  );

  type SearchRunOverrides = {
    searchTerm?: string;
    searchType?: 'serial' | 'rif';
    searchedType?: 'serial' | 'rif';
  };

  const performSearch = async (
    page: number,
    isNewSearch: boolean = false,
    pageSizeOverride?: number,
    listingFilterOverride?: PrinterListingFilter,
    overrides?: SearchRunOverrides,
  ) => {
    if (authLoading) return;

    const term = overrides?.searchTerm ?? searchTerm;
    const selectorType = overrides?.searchType ?? searchType;
    const effectiveSearchType =
      overrides?.searchedType ?? (isNewSearch ? selectorType : searchedType);
    const effectiveListingFilter = listingFilterOverride ?? listingFilter;

    const size = pageSizeOverride ?? pageSize;

    setLoading(true);
    
    // Si es nueva búsqueda, limpiamos estados previos para evitar flasheos
    if (isNewSearch) {
      setHasSearched(false);
      setResults([]);
    }

    try {
      const { data, count, exactMatch } = await printerService.searchPrintersFlexible(
        term,
        page,
        size,
        effectiveSearchType,
        effectiveListingFilter,
      );

      if (isNewSearch && term.trim() !== '') {
        if (exactMatch) {
          persistSearchReturn({
            term,
            searched: effectiveSearchType,
            selector: selectorType,
            page: 1,
            size,
            filter: effectiveListingFilter,
          });
          router.push(`/fiscal-book/${exactMatch.id}`);
          return;
        }

        if (count === 0) {
          setErrorMessage(
            effectiveSearchType === 'serial'
              ? 'No se encontró ningún equipo fiscal con un serial parecido al indicado.'
              : 'No se encontró ningún equipo fiscal con un RIF parecido al indicado.',
          );
          setHasSearched(true);
          setResults([]);
          setTotalCount(0);
          setCurrentPage(1);
          pendingScrollToResults.current = true;
          persistSearchReturn({
            term,
            searched: effectiveSearchType,
            selector: selectorType,
            page: 1,
            size,
            filter: effectiveListingFilter,
          });
          setLoading(false);
          return;
        }
      }

      if (isNewSearch) setHasSearched(true);
      setResults(data);
      setTotalCount(count ?? 0);
      setCurrentPage(page);

      persistSearchReturn({
        term,
        searched: effectiveSearchType,
        selector: selectorType,
        page,
        size,
        filter: effectiveListingFilter,
      });

      if (isNewSearch) {
        if (pendingScrollY.current == null) {
          pendingScrollToResults.current = true;
        }
      }
    } catch (error) {
      console.error("Error searching printers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || restoreStartedRef.current) return;
    if (typeof window === 'undefined') return;
    if (!shouldRestoreSearchFromUrl(window.location.search)) return;

    const saved = loadSearchReturnState();
    window.history.replaceState({}, '', '/');
    if (!saved) return;

    restoreStartedRef.current = true;
    setSearchTerm(saved.searchTerm);
    setSearchType(saved.searchType);
    setSearchedType(saved.searchedType);
    setListingFilter(saved.listingFilter);
    persistPageSize(saved.pageSize);
    pendingScrollY.current = saved.scrollY;

    void performSearch(saved.currentPage, true, saved.pageSize, saved.listingFilter, {
      searchTerm: saved.searchTerm,
      searchType: saved.searchType,
      searchedType: saved.searchedType,
    });
  }, [authLoading, persistPageSize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Clear previous errors
    
    // Validar formato de serial fiscal o RIF
    if (searchTerm.trim()) {
      if (searchTerm.trim().length < MIN_PARTIAL_SEARCH_LENGTH) {
        setErrorMessage(
          searchType === 'serial'
            ? 'Escribe al menos 2 caracteres del serial fiscal para buscar.'
            : 'Escribe al menos 2 caracteres del RIF para buscar.',
        );
        return;
      }
    }
    
    setSearchedType(searchType);
    performSearch(1, true);
  };

  const handlePageChange = (newPage: number) => {
    void performSearch(newPage, false);
  };

  const handlePageSizeChange = (next: number) => {
    persistPageSize(next);
    if (hasSearched) {
      void performSearch(1, false, next);
    }
  };

  const handleListingFilterChange = (next: PrinterListingFilter) => {
    setListingFilter(next);
    if (hasSearched) {
      void performSearch(1, false, undefined, next);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <main className="container mx-auto px-6 max-w-4xl py-12 md:py-20 flex-1 flex flex-col justify-center">

      <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Auditoría de Equipo Fiscal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Verificación segura del historial de mantenimiento y estatus operativo en la red AEG, autorizada por el SENIAT.
        </p>
      </div>

      {/* Search Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 mb-16 relative overflow-hidden transition-colors">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2" />

        <form onSubmit={handleSearch} className="relative z-10 flex flex-col md:flex-row gap-4 items-center">

          {/* Segmented Control */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full md:w-auto h-14 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSearchType('serial')}
              className={`flex-1 md:w-36 rounded-lg font-medium text-sm transition-all duration-200 ${searchType === 'serial'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              Serial
            </button>
            <button
              type="button"
              onClick={() => setSearchType('rif')}
              className={`flex-1 md:w-36 rounded-lg font-medium text-sm transition-all duration-200 ${searchType === 'rif'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              RIF
            </button>
          </div>

          {/* Premium Input */}
          <div className="relative w-full group flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={searchType === 'serial' ? 'Ej: GRA0000123' : 'Ej: J12345678'}
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                className="w-full h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 text-lg outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-300 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium font-mono"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <SearchIcon size={20} />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/10 active:scale-[0.95] flex items-center justify-center gap-2 min-w-[150px]"
            >
              {loading ? (
                <>
                  <div className="w-[18px] h-[18px] border-2 border-white/80 border-t-white rounded-full animate-spin"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                "Auditar"
              )}
            </button>
          </div>

        </form>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-all flex-shrink-0"
                title="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>

      <p className="mt-[-1rem] md:mt-[-2.5rem] mb-12 text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-2 duration-1000">
        Deje el campo vacío para ver todos los resultados
      </p>

      {/* Results Area */}
      {hasSearched && (
        <div
          ref={resultsRef}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-[5.5rem]"
        >
          <div className="mb-6 px-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Resultado de la Búsqueda
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex h-10 w-full sm:w-auto bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {LISTING_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={loading}
                    onClick={() => handleListingFilterChange(option.value)}
                    className={`flex-1 sm:flex-none sm:min-w-[5.5rem] h-full px-3 rounded-lg font-medium text-xs uppercase tracking-wide transition-all duration-200 disabled:opacity-50 ${
                      listingFilter === option.value
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 h-10">
                <label className="inline-flex items-center gap-2 h-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="whitespace-nowrap">Por página</span>
                  <select
                    value={pageSize}
                    disabled={loading}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="h-full min-w-[4.5rem] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2 text-sm font-semibold normal-case tracking-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="inline-flex items-center h-full text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 rounded-full border border-slate-200 dark:border-slate-700">
                  {totalCount} Total
                </span>
                {totalPages > 1 ? (
                  <span className="inline-flex items-center h-full text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 rounded-full border border-blue-100 dark:border-blue-800/30 whitespace-nowrap">
                    Página {currentPage} de {totalPages}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-20">
            {results.length > 0 ? (
              <>
                {results.map((printer) => (
                  <Link
                    key={printer.id}
                    href={`/fiscal-book/${printer.id}`}
                    onClick={() => {
                      if (!hasSearched) return;
                      persistSearchReturn({
                        term: searchTerm,
                        searched: searchedType,
                        selector: searchType,
                        page: currentPage,
                        size: pageSize,
                        filter: listingFilter,
                        scrollY: window.scrollY,
                      });
                    }}
                    className="block bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md dark:hover:shadow-blue-900/10 transition-all group relative overflow-hidden"
                  >
                    {/* Hover Accent Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {printer.businessName || (
                            <span className="italic text-slate-400 dark:text-slate-600">N/D</span>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                          <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md font-mono border border-slate-100 dark:border-slate-700">
                            RIF: {printer.rif || <NoData />}
                          </span>
                          <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md font-mono border border-slate-100 dark:border-slate-700">
                            SN: {printer.serial_fiscal}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-between md:justify-end w-full md:w-auto gap-4 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        {/* Status Badge mapping for real DB values */}
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${printerEstatusBadgeClass(printer.estatus)}`}>
                          {printerEstatusLabel(printer.estatus)}
                        </span>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-100 dark:group-hover:border-blue-800/50 transition-all shrink-0">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Simplified Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 py-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-2 group"
                    >
                      <ArrowRight size={16} className="rotate-180" />
                      Anterior
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        // Only show current, first, last, and neighbors
                        if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                          return (
                            <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-110'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                            >
                              {p}
                            </button>
                          );
                        } else if (p === currentPage - 2 || p === currentPage + 2) {
                          return <span key={p} className="text-slate-300 dark:text-slate-700 text-xs">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm flex items-center gap-2 group"
                    >
                      Siguiente
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : !loading && results.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 transition-colors">
                {listingFilter === 'activa'
                  ? 'No se encontraron equipos activos con los parámetros indicados.'
                  : listingFilter === 'retirada'
                    ? 'No se encontraron equipos retirados con los parámetros indicados.'
                    : 'No se encontraron equipos fiscales con los parámetros indicados. Prueba dejando el campo vacío para ver todos los registros.'}
              </div>
            ) : null}
          </div>
        </div>
      )}

    </main>
  );
}

