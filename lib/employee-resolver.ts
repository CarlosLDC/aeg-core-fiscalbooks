import { fetchEmployees } from '@/lib/employees-api';

let cachedEmployees: Awaited<ReturnType<typeof fetchEmployees>> | null = null;

async function loadEmployees() {
  if (!cachedEmployees) {
    cachedEmployees = await fetchEmployees();
  }
  return cachedEmployees;
}

export function clearEmployeeCache() {
  cachedEmployees = null;
}

export async function resolveEmployeeIdByEmail(
  email: string,
): Promise<number | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const employees = await loadEmployees();
  const match = employees.find(
    (e) => e.email.trim().toLowerCase() === normalized,
  );
  return match?.id ?? null;
}
