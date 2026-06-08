import { apiFetch } from '@/lib/api';
import type { ServiceCenterResponse } from '@/types/employee';

const BASE = '/api/service-centers';

export async function fetchServiceCenters(): Promise<ServiceCenterResponse[]> {
  return apiFetch<ServiceCenterResponse[]>(BASE);
}
