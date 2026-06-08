import { apiFetch } from '@/lib/api';
import type { SealResponse } from '@/types/seal';

const BASE = '/api/seals';

export async function fetchSeals(): Promise<SealResponse[]> {
  return apiFetch<SealResponse[]>(BASE);
}
