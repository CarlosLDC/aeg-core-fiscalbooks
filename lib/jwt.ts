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
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

export function getUsernameFromToken(token: string): string | null {
  return parseJwtPayload(token)?.sub ?? null;
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
  const normalized = value.replace(/^ROLE_/, '');
  return ROLES.includes(normalized as Role) ? (normalized as Role) : null;
}

function rolesFromClaimList(value: unknown): Role | null {
  if (!Array.isArray(value)) return null;
  for (const entry of value) {
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
