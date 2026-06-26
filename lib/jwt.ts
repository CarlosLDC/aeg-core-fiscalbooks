import type { JwtPayload } from '@/types/auth';
import { ROLES, type Role } from '@/types/user';

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

export function getUsernameFromToken(token: string): string | null {
  const payload = parseJwtPayload(token);
  return (
    payload?.sub ??
    payload?.username ??
    payload?.preferred_username ??
    payload?.email ??
    payload?.userName ??
    payload?.user_name ??
    null
  );
}

function parseNumericClaim(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeRoleClaim(value: unknown): Role | null {
  if (typeof value !== 'string') return null;
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, '')
    .replace(/-/g, '_');
  const aliases: Record<string, Role> = {
    ADMINISTRATOR: 'ADMIN',
    TECNICO: 'TECHNICIAN',
    TECH: 'TECHNICIAN',
    DISTRIBUIDORA: 'DISTRIBUTOR',
    DISTRIBUTOR_USER: 'DISTRIBUTOR',
    CENTRO_SERVICIO: 'TECHNICIAN',
    SERVICECENTER: 'TECHNICIAN',
    SERVICE_CENTER: 'TECHNICIAN',
    INSPECTOR: 'SENIAT',
    FISCAL_ADMIN: 'ADMIN',
    FISCAL_TECHNICIAN: 'TECHNICIAN',
    FISCAL_AUDITOR: 'SENIAT',
    AUDITOR: 'SENIAT',
  };
  const role = aliases[normalized] ?? normalized;
  return ROLES.includes(role as Role) ? (role as Role) : null;
}

function rolesFromClaimList(value: unknown): Role | null {
  const entries =
    typeof value === 'string' ? value.split(/\s+/) : Array.isArray(value) ? value : [];
  for (const entry of entries) {
    const role = normalizeRoleClaim(String(entry));
    if (role) return role;
  }
  return null;
}

export function getRoleFromToken(token: string): Role | null {
  const payload = parseJwtPayload(token) as Record<string, unknown> | null;
  if (!payload) return null;

  const direct =
    normalizeRoleClaim(payload.role) ??
    normalizeRoleClaim(payload.userRole) ??
    normalizeRoleClaim(payload.user_role);
  if (direct) return direct;

  const fromLists =
    rolesFromClaimList(payload.authorities) ??
    rolesFromClaimList(payload.roles) ??
    rolesFromClaimList(payload.scope);
  if (fromLists) return fromLists;

  return null;
}

export function getBranchIdFromToken(token: string): number | null {
  const payload = parseJwtPayload(token) as Record<string, unknown> | null;
  if (!payload) return null;
  return (
    parseNumericClaim(payload.branchId) ??
    parseNumericClaim(payload.branch_id)
  );
}

export function getDistributorIdFromToken(token: string): number | null {
  const payload = parseJwtPayload(token) as Record<string, unknown> | null;
  if (!payload) return null;
  return (
    parseNumericClaim(payload.distributorId) ??
    parseNumericClaim(payload.distributor_id)
  );
}

export function getUserIdFromToken(token: string): number | null {
  const payload = parseJwtPayload(token) as Record<string, unknown> | null;
  if (!payload) return null;
  return (
    parseNumericClaim(payload.userId) ??
    parseNumericClaim(payload.user_id)
  );
}

export function getNationalIdFromToken(token: string): string | null {
  const payload = parseJwtPayload(token) as Record<string, unknown> | null;
  if (!payload) return null;
  const value = payload.nationalId ?? payload.national_id;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
