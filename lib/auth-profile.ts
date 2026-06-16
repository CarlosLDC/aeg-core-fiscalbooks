import {
  clearStoredProfile,
  getStoredProfile,
  setStoredProfile,
} from '@/lib/auth-profile-storage';
import { isRemembered } from '@/lib/auth-storage';
import { toNumber, toStringOrNull } from '@/lib/api-contract';
import {
  getBranchIdFromToken,
  getDistributorIdFromToken,
  getEmployeeIdFromToken,
  getRoleFromToken,
  getUsernameFromToken,
} from '@/lib/jwt';
import { fetchAuthMe } from '@/lib/auth-me-api';
import { resolveEmployeeIdByEmail } from '@/lib/employee-resolver';
import { ApiError } from '@/types/auth';
import { ROLES, type Role } from '@/types/user';

export type UserProfile = {
  username: string;
  name: string | null;
  email: string;
  role: Role;
  branchId: number | null;
  distributorId: number | null;
  employeeId: number | null;
};

function normalizeRole(value: unknown): Role | null {
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
    CENTRO_SERVICIO: 'SERVICE_CENTER',
    SERVICECENTER: 'SERVICE_CENTER',
    INSPECTOR: 'SENIAT',
  };
  const role = aliases[normalized] ?? normalized;
  return ROLES.includes(role as Role) ? (role as Role) : null;
}

function roleFromMe(me: Awaited<ReturnType<typeof fetchAuthMe>>): Role | null {
  const direct = normalizeRole(me.role);
  if (direct) return direct;

  for (const list of [me.roles, me.authorities]) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const role = normalizeRole(entry);
      if (role) return role;
    }
  }

  return null;
}

function usernameFromMe(
  me: Awaited<ReturnType<typeof fetchAuthMe>> | null,
  fallback: string | null,
): string | null {
  return (
    toStringOrNull(me?.username) ??
    toStringOrNull(me?.userName) ??
    toStringOrNull(me?.email) ??
    fallback
  );
}

function emailFromMe(
  me: Awaited<ReturnType<typeof fetchAuthMe>> | null,
  fallback: string,
): string {
  return (
    toStringOrNull(me?.email) ??
    toStringOrNull(me?.username) ??
    toStringOrNull(me?.userName) ??
    fallback
  );
}

function nameFromMe(me: Awaited<ReturnType<typeof fetchAuthMe>> | null): string | null {
  return toStringOrNull(me?.name) ?? toStringOrNull(me?.fullName);
}

function branchIdFromMe(me: Awaited<ReturnType<typeof fetchAuthMe>> | null): number | null {
  return toNumber(me?.branchId) ?? toNumber(me?.branch_id);
}

function distributorIdFromMe(
  me: Awaited<ReturnType<typeof fetchAuthMe>> | null,
): number | null {
  return toNumber(me?.distributorId) ?? toNumber(me?.distributor_id);
}

function employeeIdFromMe(me: Awaited<ReturnType<typeof fetchAuthMe>> | null): number | null {
  return toNumber(me?.employeeId) ?? toNumber(me?.employee_id);
}

function profileFromMe(
  username: string,
  me: Awaited<ReturnType<typeof fetchAuthMe>>,
  employeeId: number | null,
  fallbackRole: Role,
): UserProfile {
  const email = emailFromMe(me, username);
  return {
    username,
    name: nameFromMe(me),
    email,
    role: roleFromMe(me) ?? fallbackRole,
    branchId: branchIdFromMe(me),
    distributorId: distributorIdFromMe(me),
    employeeId,
  };
}

export async function resolveAndStoreUserProfile(
  token: string,
  remember = false,
): Promise<UserProfile> {
  let username = getUsernameFromToken(token);
  let me: Awaited<ReturnType<typeof fetchAuthMe>> | null = null;

  try {
    me = await fetchAuthMe();
    username = usernameFromMe(me, username);
  } catch {
    /* el perfil remoto es opcional si el token trae los claims necesarios */
  }

  if (!username) {
    throw new ApiError('Token de sesión inválido', 401);
  }

  let role = getRoleFromToken(token);
  let branchId = getBranchIdFromToken(token);
  let distributorId = getDistributorIdFromToken(token);
  const name = nameFromMe(me);
  const email = emailFromMe(me, username);
  let employeeId = employeeIdFromMe(me) ?? getEmployeeIdFromToken(token);

  if (me) {
    role = role ?? roleFromMe(me);
    branchId = branchId ?? branchIdFromMe(me);
    distributorId = distributorId ?? distributorIdFromMe(me);
  }

  if (employeeId == null) {
    employeeId = await resolveEmployeeIdByEmail(email).catch(() => null);
  }

  if (!role || !ROLES.includes(role)) {
    throw new ApiError(
      'Inicio de sesión correcto, pero no pudimos determinar tus permisos. Contacta al administrador del sistema.',
      401,
    );
  }

  const profile: UserProfile = {
    username,
    name,
    email,
    role,
    branchId: branchId ?? null,
    distributorId: distributorId ?? null,
    employeeId,
  };

  setStoredProfile(
    {
      role: profile.role,
      branchId: profile.branchId,
      distributorId: profile.distributorId,
      name: profile.name,
      employeeId: profile.employeeId,
    },
    remember,
  );
  return profile;
}

export function getProfileFromStorage(
  username: string,
  token: string,
): UserProfile | null {
  const stored = getStoredProfile();
  const role = stored?.role ?? getRoleFromToken(token);
  if (!role) return null;

  return {
    username,
    name: stored?.name ?? null,
    email: username,
    role,
    branchId: stored?.branchId ?? getBranchIdFromToken(token) ?? null,
    distributorId:
      stored?.distributorId ?? getDistributorIdFromToken(token) ?? null,
    employeeId: stored?.employeeId ?? null,
  };
}

export async function refreshUserProfileFromApi(
  username: string,
  token: string,
): Promise<UserProfile | null> {
  const current = getProfileFromStorage(username, token);
  if (!current) return null;

  try {
    const me = await fetchAuthMe();
    const employeeId =
      current.employeeId ??
      employeeIdFromMe(me) ??
      getEmployeeIdFromToken(token) ??
      (await resolveEmployeeIdByEmail(emailFromMe(me, username)));
    const profile = {
      ...profileFromMe(username, me, employeeId, current.role),
      branchId: branchIdFromMe(me) ?? current.branchId,
      distributorId: distributorIdFromMe(me) ?? current.distributorId,
    };

    setStoredProfile(
      {
        role: profile.role,
        branchId: profile.branchId,
        distributorId: profile.distributorId,
        name: profile.name,
        employeeId: profile.employeeId,
      },
      isRemembered(),
    );
    return profile;
  } catch {
    return current;
  }
}

export function clearUserProfile() {
  clearStoredProfile();
}
