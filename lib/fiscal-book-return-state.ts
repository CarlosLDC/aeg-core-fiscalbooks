export const FISCAL_BOOK_RETURN_STORAGE_KEY = 'aeg-fiscal-book-return';
export const FISCAL_BOOK_RESTORE_QUERY = 'restoreBook';

export type FiscalBookViewMode = 'info' | 'tech' | 'inspection';

export type FiscalBookReturnState = {
  printerId: string;
  viewMode: FiscalBookViewMode;
  currentPage: number;
  techFilterQuery: string;
  techFilterFrom: string;
  techFilterTo: string;
  inspFilterQuery: string;
  inspFilterFrom: string;
  inspFilterTo: string;
  isFiltersOpen: boolean;
  scrollY: number;
};

function isViewMode(value: unknown): value is FiscalBookViewMode {
  return value === 'info' || value === 'tech' || value === 'inspection';
}

export function saveFiscalBookReturnState(state: FiscalBookReturnState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(FISCAL_BOOK_RETURN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadFiscalBookReturnState(
  printerId: string,
): FiscalBookReturnState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(FISCAL_BOOK_RETURN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FiscalBookReturnState>;
    if (parsed.printerId !== printerId) return null;
    if (!isViewMode(parsed.viewMode)) return null;
    return {
      printerId,
      viewMode: parsed.viewMode,
      currentPage: Math.max(0, Number(parsed.currentPage) || 0),
      techFilterQuery: typeof parsed.techFilterQuery === 'string' ? parsed.techFilterQuery : '',
      techFilterFrom: typeof parsed.techFilterFrom === 'string' ? parsed.techFilterFrom : '',
      techFilterTo: typeof parsed.techFilterTo === 'string' ? parsed.techFilterTo : '',
      inspFilterQuery: typeof parsed.inspFilterQuery === 'string' ? parsed.inspFilterQuery : '',
      inspFilterFrom: typeof parsed.inspFilterFrom === 'string' ? parsed.inspFilterFrom : '',
      inspFilterTo: typeof parsed.inspFilterTo === 'string' ? parsed.inspFilterTo : '',
      isFiltersOpen: Boolean(parsed.isFiltersOpen),
      scrollY: Math.max(0, Number(parsed.scrollY) || 0),
    };
  } catch {
    return null;
  }
}

export function hasFiscalBookReturnState(printerId: string): boolean {
  return loadFiscalBookReturnState(printerId) != null;
}

export function buildFiscalBookRestoreHref(printerId: string): string {
  return hasFiscalBookReturnState(printerId)
    ? `/fiscal-book/${printerId}?${FISCAL_BOOK_RESTORE_QUERY}=1`
    : `/fiscal-book/${printerId}`;
}

export function shouldRestoreFiscalBookFromUrl(search: string): boolean {
  return new URLSearchParams(search).get(FISCAL_BOOK_RESTORE_QUERY) === '1';
}
