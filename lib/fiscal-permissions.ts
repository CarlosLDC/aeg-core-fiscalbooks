import type { UserProfile } from '@/lib/auth-profile';
import type { Role } from '@/types/user';

export function isServiceCenterTechnician(profile: UserProfile | null | undefined): boolean {
  return profile?.role === 'TECHNICIAN' && profile.branchId != null;
}

export function canCreateTechnicalService(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === 'ADMIN' || isServiceCenterTechnician(profile);
}

export function canCreateAnnualInspection(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return (
    profile.role === 'ADMIN' ||
    profile.role === 'DISTRIBUTOR' ||
    isServiceCenterTechnician(profile)
  );
}

export function canReadFiscalBook(role: Role | null | undefined): boolean {
  if (!role) return false;
  return ['ADMIN', 'DISTRIBUTOR', 'TECHNICIAN', 'SENIAT'].includes(role);
}
