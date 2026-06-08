import { apiFetch } from '@/lib/api';
import type {
  FiscalBookDetailResponse,
  FiscalBookSearchResponse,
} from '@/types/fiscal-book';

const BASE = '/api/fiscal-books';

export async function searchFiscalBooks(
  query: string,
  page = 1,
  pageSize = 10,
): Promise<FiscalBookSearchResponse> {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return apiFetch<FiscalBookSearchResponse>(`${BASE}/search?${params.toString()}`);
}

export async function fetchFiscalBookByPrinterId(
  printerId: number,
): Promise<FiscalBookDetailResponse> {
  return apiFetch<FiscalBookDetailResponse>(`${BASE}/${printerId}`);
}
