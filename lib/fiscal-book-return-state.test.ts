import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FISCAL_BOOK_RETURN_STORAGE_KEY,
  buildFiscalBookRestoreHref,
  loadFiscalBookReturnState,
  saveFiscalBookReturnState,
  shouldRestoreFiscalBookFromUrl,
} from '@/lib/fiscal-book-return-state';

const printerId = 'fp-42';
const sampleState = {
  printerId,
  viewMode: 'tech' as const,
  currentPage: 2,
  techFilterQuery: 'mantenimiento',
  techFilterFrom: '2026-01-01',
  techFilterTo: '2026-06-30',
  inspFilterQuery: '',
  inspFilterFrom: '',
  inspFilterTo: '',
  isFiltersOpen: true,
  scrollY: 180,
};

function createSessionStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

beforeEach(() => {
  vi.stubGlobal('window', {} as Window);
  vi.stubGlobal('sessionStorage', createSessionStorageMock());
});

afterEach(() => {
  sessionStorage.removeItem(FISCAL_BOOK_RETURN_STORAGE_KEY);
  vi.unstubAllGlobals();
});

describe('fiscal-book-return-state', () => {
  it('persists and loads a book snapshot for the same printer', () => {
    saveFiscalBookReturnState(sampleState);
    expect(loadFiscalBookReturnState(printerId)).toEqual(sampleState);
    expect(loadFiscalBookReturnState('other')).toBeNull();
  });

  it('builds restore href only when a snapshot exists', () => {
    expect(buildFiscalBookRestoreHref(printerId)).toBe(`/fiscal-book/${printerId}`);
    saveFiscalBookReturnState(sampleState);
    expect(buildFiscalBookRestoreHref(printerId)).toBe(
      `/fiscal-book/${printerId}?restoreBook=1`,
    );
  });

  it('detects restore query param', () => {
    expect(shouldRestoreFiscalBookFromUrl('?restoreBook=1')).toBe(true);
    expect(shouldRestoreFiscalBookFromUrl('')).toBe(false);
  });
});
