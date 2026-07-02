import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SEARCH_RETURN_STORAGE_KEY,
  buildSearchRestoreHref,
  loadSearchReturnState,
  saveSearchReturnState,
  shouldRestoreSearchFromUrl,
} from '@/lib/search-return-state';

const sampleState = {
  active: true,
  searchTerm: 'GRA0000123',
  searchType: 'serial' as const,
  searchedType: 'serial' as const,
  currentPage: 2,
  pageSize: 10,
  listingFilter: 'activa' as const,
  scrollY: 420,
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
  sessionStorage.removeItem(SEARCH_RETURN_STORAGE_KEY);
  vi.unstubAllGlobals();
});

describe('search-return-state', () => {
  it('persists and loads an active search snapshot', () => {
    saveSearchReturnState(sampleState);
    expect(loadSearchReturnState()).toEqual(sampleState);
  });

  it('ignores inactive snapshots', () => {
    saveSearchReturnState({ ...sampleState, active: false });
    expect(loadSearchReturnState()).toBeNull();
  });

  it('builds restore href only when a snapshot exists', () => {
    expect(buildSearchRestoreHref()).toBe('/');
    saveSearchReturnState(sampleState);
    expect(buildSearchRestoreHref()).toBe('/?restoreSearch=1');
  });

  it('detects restore query param', () => {
    expect(shouldRestoreSearchFromUrl('?restoreSearch=1')).toBe(true);
    expect(shouldRestoreSearchFromUrl('')).toBe(false);
  });
});
