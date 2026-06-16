import { apiFetch } from '@/lib/api';
import { normalizePaginatedResponse, unwrapApiPayload } from '@/lib/api-contract';
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
  const response = await apiFetch<unknown>(`${BASE}/search?${params.toString()}`);
  return normalizePaginatedResponse(response, page, pageSize);
}

export async function fetchFiscalBookByPrinterId(
  printerId: number,
): Promise<FiscalBookDetailResponse> {
  const response = await apiFetch<unknown>(`${BASE}/${printerId}`);
  return unwrapApiPayload<FiscalBookDetailResponse>(response);
}
