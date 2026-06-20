import { toNumber } from '@/lib/api-contract';
import { fetchServiceCenters } from '@/lib/service-centers-api';
import type { UserProfile } from '@/lib/auth-profile';

export type ResolvedTechnicianContext = {
  userId: number;
  userName: string;
  userNationalId: string;
  serviceCenterId: number | null;
  distributorId: number | null;
  companyName: string | null;
  companyRif: string | null;
  branchCity: string | null;
  branchState: string | null;
};

export async function resolveTechnicianForProfile(
  profile: UserProfile,
): Promise<ResolvedTechnicianContext | { message: string }> {
  if (!profile.userId) {
    return {
      message:
        'Su perfil no tiene un usuario vinculado. Contacte al administrador del sistema.',
    };
  }

  let serviceCenterId: number | null = null;
  if (profile.branchId != null) {
    const serviceCenters = await fetchServiceCenters();
    const serviceCenter =
      serviceCenters.find(
        (sc) =>
          (toNumber(sc.branchId) ??
            toNumber((sc as { branch_id?: unknown }).branch_id)) === profile.branchId,
      ) ?? null;
    serviceCenterId = serviceCenter ? toNumber(serviceCenter.id) : null;
  }

  return {
    userId: profile.userId,
    userName: profile.name ?? profile.username ?? 'Técnico',
    userNationalId: profile.nationalId ?? '',
    serviceCenterId,
    distributorId: profile.distributorId,
    companyName: null,
    companyRif: null,
    branchCity: null,
    branchState: null,
  };
}
