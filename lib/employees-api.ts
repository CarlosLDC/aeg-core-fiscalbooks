import { apiFetch } from '@/lib/api';
import type { EmployeeResponse } from '@/types/employee';

const BASE = '/api/employees';

export async function fetchEmployees(): Promise<EmployeeResponse[]> {
  return apiFetch<EmployeeResponse[]>(BASE);
}
