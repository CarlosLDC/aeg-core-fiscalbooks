import { apiFetch } from '@/lib/api';
import type { TechnicianResponse } from '@/types/employee';

const BASE = '/api/technicians';

export async function fetchTechnicians(): Promise<TechnicianResponse[]> {
  return apiFetch<TechnicianResponse[]>(BASE);
}
