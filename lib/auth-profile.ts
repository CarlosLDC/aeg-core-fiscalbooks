import {
  clearStoredProfile,
  getStoredProfile,
  setStoredProfile,
} from '@/lib/auth-profile-storage';
import { isRemembered } from '@/lib/auth-storage';
import {
  getBranchIdFromToken,
  getDistributorIdFromToken,
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

function profileFromMe(
  username: string,
  me: Awaited<ReturnType<typeof fetchAuthMe>>,
  employeeId: number | null,
): UserProfile {
  const email = me.email?.trim() || me.username?.trim() || username;
  return {
    username,
    name: me.name?.trim() || null,
    email,
    role: me.role,
    branchId: me.branchId ?? null,
    distributorId: me.distributorId ?? null,
    employeeId,
  };
}

export async function resolveAndStoreUserProfile(
  token: string,
  remember = false,
): Promise<UserProfile> {
  const username = getUsernameFromToken(token);
  if (!username) {
    throw new ApiError('Token de sesión inválido', 401);
  }

  let role = getRoleFromToken(token);
  let branchId = getBranchIdFromToken(token);
  let distributorId = getDistributorIdFromToken(token);
  let name: string | null = null;
  let email = username;
  let employeeId: number | null = null;

  try {
    const me = await fetchAuthMe();
    email = me.email?.trim() || me.username?.trim() || username;
    role = role ?? me.role;
    branchId = branchId ?? me.branchId;
    distributorId = distributorId ?? me.distributorId;
    name = me.name?.trim() || null;
    employeeId = await resolveEmployeeIdByEmail(email);
  } catch {
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
      (await resolveEmployeeIdByEmail(me.email || username));
    const profile = profileFromMe(username, me, employeeId);

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
