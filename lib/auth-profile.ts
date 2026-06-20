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
  getNationalIdFromToken,
  getRoleFromToken,
  getUserIdFromToken,
  getUsernameFromToken,
} from '@/lib/jwt';
import { fetchAuthMe } from '@/lib/auth-me-api';
import { ApiError } from '@/types/auth';
import { ROLES, type Role } from '@/types/user';

export type UserProfile = {
  userId: number | null;
  username: string;
  name: string | null;
  email: string;
  nationalId: string | null;
  role: Role;
  branchId: number | null;
  distributorId: number | null;
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
    DISTRIBUIDORA: 'TECHNICIAN',
    DISTRIBUTOR_USER: 'TECHNICIAN',
    DISTRIBUTOR: 'TECHNICIAN',
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

function userIdFromMe(me: Awaited<ReturnType<typeof fetchAuthMe>> | null): number | null {
  return toNumber(me?.id);
}

function nationalIdFromMe(me: Awaited<ReturnType<typeof fetchAuthMe>> | null): string | null {
  return toStringOrNull(me?.nationalId) ?? toStringOrNull(me?.national_id);
}

function profileFromMe(
  username: string,
  me: Awaited<ReturnType<typeof fetchAuthMe>>,
  userId: number | null,
  nationalId: string | null,
  fallbackRole: Role,
): UserProfile {
  const email = emailFromMe(me, username);
  return {
    userId,
    username,
    name: nameFromMe(me),
    email,
    nationalId,
    role: roleFromMe(me) ?? fallbackRole,
    branchId: branchIdFromMe(me),
    distributorId: distributorIdFromMe(me),
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
  let userId = userIdFromMe(me) ?? getUserIdFromToken(token);
  let nationalId = nationalIdFromMe(me) ?? getNationalIdFromToken(token);

  if (me) {
    role = role ?? roleFromMe(me);
    branchId = branchId ?? branchIdFromMe(me);
    distributorId = distributorId ?? distributorIdFromMe(me);
    userId = userId ?? userIdFromMe(me);
    nationalId = nationalId ?? nationalIdFromMe(me);
  }

  if (!role || !ROLES.includes(role)) {
    throw new ApiError(
      'Inicio de sesión correcto, pero no pudimos determinar tus permisos. Contacta al administrador del sistema.',
      401,
    );
  }

  const profile: UserProfile = {
    userId,
    username,
    name,
    email,
    nationalId,
    role,
    branchId: branchId ?? null,
    distributorId: distributorId ?? null,
  };

  setStoredProfile(
    {
      role: profile.role,
      userId: profile.userId,
      branchId: profile.branchId,
      distributorId: profile.distributorId,
      name: profile.name,
      nationalId: profile.nationalId,
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
    userId: stored?.userId ?? getUserIdFromToken(token) ?? null,
    username,
    name: stored?.name ?? null,
    email: username,
    nationalId: stored?.nationalId ?? getNationalIdFromToken(token) ?? null,
    role,
    branchId: stored?.branchId ?? getBranchIdFromToken(token) ?? null,
    distributorId:
      stored?.distributorId ?? getDistributorIdFromToken(token) ?? null,
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
    const userId =
      userIdFromMe(me) ??
      current.userId ??
      getUserIdFromToken(token);
    const nationalId =
      nationalIdFromMe(me) ??
      current.nationalId ??
      getNationalIdFromToken(token);
    const profile = {
      ...profileFromMe(username, me, userId, nationalId, current.role),
      branchId: branchIdFromMe(me) ?? current.branchId,
      distributorId: distributorIdFromMe(me) ?? current.distributorId,
    };

    setStoredProfile(
      {
        role: profile.role,
        userId: profile.userId,
        branchId: profile.branchId,
        distributorId: profile.distributorId,
        name: profile.name,
        nationalId: profile.nationalId,
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
