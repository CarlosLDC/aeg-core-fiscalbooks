import { apiFetch } from '@/lib/api';
import { unwrapList } from '@/lib/api-contract';
import type { ServiceCenterResponse } from '@/types/employee';

const BASE = '/api/service-centers';

export async function fetchServiceCenters(): Promise<ServiceCenterResponse[]> {
  const response = await apiFetch<unknown>(BASE);
  return unwrapList<ServiceCenterResponse>(response);
}
