import { apiFetch } from '@/lib/api';
import { unwrapList } from '@/lib/api-contract';
import type { EmployeeResponse } from '@/types/employee';

const BASE = '/api/employees';

export async function fetchEmployees(): Promise<EmployeeResponse[]> {
  const response = await apiFetch<unknown>(BASE);
  return unwrapList<EmployeeResponse>(response);
}
