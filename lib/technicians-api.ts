import { apiFetch } from '@/lib/api';
import { unwrapList } from '@/lib/api-contract';
import type { TechnicianResponse } from '@/types/employee';

const BASE = '/api/technicians';

export async function fetchTechnicians(): Promise<TechnicianResponse[]> {
  const response = await apiFetch<unknown>(BASE);
  return unwrapList<TechnicianResponse>(response);
}
