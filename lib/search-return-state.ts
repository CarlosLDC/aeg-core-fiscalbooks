import type { PrinterListingFilter } from '@/lib/printer-status';

export const SEARCH_RETURN_STORAGE_KEY = 'aeg-fiscal-search-return';
export const SEARCH_RESTORE_QUERY = 'restoreSearch';

export type SearchReturnState = {
  active: boolean;
  searchTerm: string;
  searchType: 'serial' | 'rif';
  searchedType: 'serial' | 'rif';
  currentPage: number;
  pageSize: number;
  listingFilter: PrinterListingFilter;
  scrollY: number;
};

export function saveSearchReturnState(state: SearchReturnState): void {
  if (typeof window === 'undefined' || !state.active) return;
  try {
    sessionStorage.setItem(SEARCH_RETURN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadSearchReturnState(): SearchReturnState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SEARCH_RETURN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SearchReturnState>;
    if (!parsed.active) return null;
    if (parsed.searchType !== 'serial' && parsed.searchType !== 'rif') return null;
    if (parsed.searchedType !== 'serial' && parsed.searchedType !== 'rif') return null;
    if (
      parsed.listingFilter !== 'all' &&
      parsed.listingFilter !== 'activa' &&
      parsed.listingFilter !== 'retirada'
    ) {
      return null;
    }
    return {
      active: true,
      searchTerm: typeof parsed.searchTerm === 'string' ? parsed.searchTerm : '',
      searchType: parsed.searchType,
      searchedType: parsed.searchedType,
      currentPage: Math.max(1, Number(parsed.currentPage) || 1),
      pageSize: Math.max(1, Number(parsed.pageSize) || 5),
      listingFilter: parsed.listingFilter,
      scrollY: Math.max(0, Number(parsed.scrollY) || 0),
    };
  } catch {
    return null;
  }
}

export function hasSearchReturnState(): boolean {
  return loadSearchReturnState() != null;
}

export function buildSearchRestoreHref(): string {
  return hasSearchReturnState() ? `/?${SEARCH_RESTORE_QUERY}=1` : '/';
}

export function shouldRestoreSearchFromUrl(search: string): boolean {
  return new URLSearchParams(search).get(SEARCH_RESTORE_QUERY) === '1';
}
