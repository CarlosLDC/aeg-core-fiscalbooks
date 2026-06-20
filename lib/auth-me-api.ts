import { apiFetch } from '@/lib/api';
import type { Role } from '@/types/user';

export type AuthMeResponse = {
  id?: number;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  username?: string | null;
  userName?: string | null;
  role?: Role | string | null;
  roles?: string[];
  authorities?: string[];
  branchId?: number | string | null;
  branch_id?: number | string | null;
  distributorId?: number | string | null;
  distributor_id?: number | string | null;
  employeeId?: number | string | null;
  employee_id?: number | string | null;
  enabled?: boolean;
};

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>('/api/auth/me');
}
