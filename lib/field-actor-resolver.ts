import { toNumber } from '@/lib/api-contract';
import { manufacturerCompanyFields } from '@/lib/manufacturer-company';
import { fetchServiceCenters } from '@/lib/service-centers-api';
import type { UserProfile } from '@/lib/auth-profile';

export type ResolvedFieldActor = {
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

async function resolveServiceCenterId(profile: UserProfile): Promise<number | null> {
  if (profile.branchId == null) return null;
  const serviceCenters = await fetchServiceCenters();
  const serviceCenter =
    serviceCenters.find(
      (sc) =>
        (toNumber(sc.branchId) ??
          toNumber((sc as { branch_id?: unknown }).branch_id)) === profile.branchId,
    ) ?? null;
  return serviceCenter ? toNumber(serviceCenter.id) : null;
}

function baseActor(profile: UserProfile): Omit<ResolvedFieldActor, 'serviceCenterId' | 'distributorId'> {
  return {
    userId: profile.userId!,
    userName: profile.name ?? profile.username ?? 'Usuario',
    userNationalId: profile.nationalId ?? '',
    companyName: null,
    companyRif: null,
    branchCity: null,
    branchState: null,
  };
}

export async function resolveTechnicalServiceActor(
  profile: UserProfile,
): Promise<ResolvedFieldActor | { message: string }> {
  if (!profile.userId) {
    return {
      message:
        'Su perfil no tiene un usuario vinculado. Contacte al administrador del sistema.',
    };
  }

  if (profile.role === 'ADMIN') {
    const serviceCenterId = await resolveServiceCenterId(profile);
    return {
      ...baseActor(profile),
      ...manufacturerCompanyFields(),
      serviceCenterId,
      distributorId: null,
    };
  }

  if (profile.role === 'TECHNICIAN') {
    if (profile.branchId == null) {
      return {
        message:
          'Debe estar asignado a un centro de servicio para registrar servicios técnicos.',
      };
    }
    const serviceCenterId = await resolveServiceCenterId(profile);
    if (serviceCenterId == null) {
      return {
        message:
          'No se encontró un centro de servicio vinculado a su sucursal. Contacte al administrador.',
      };
    }
    return {
      ...baseActor(profile),
      serviceCenterId,
      distributorId: null,
    };
  }

  return {
    message:
      'Solo administradores o técnicos de centro de servicio pueden registrar servicios técnicos.',
  };
}

export async function resolveAnnualInspectionActor(
  profile: UserProfile,
): Promise<ResolvedFieldActor | { message: string }> {
  if (!profile.userId) {
    return {
      message:
        'Su perfil no tiene un usuario vinculado. Contacte al administrador del sistema.',
    };
  }

  if (profile.role === 'DISTRIBUTOR') {
    if (!profile.nationalId?.trim()) {
      return {
        message:
          'Su perfil de distribuidor debe tener cédula de identidad registrada para actuar como inspector.',
      };
    }
    return {
      ...baseActor(profile),
      serviceCenterId: null,
      distributorId: profile.distributorId,
    };
  }

  if (profile.role === 'ADMIN' || profile.role === 'TECHNICIAN') {
    if (profile.role === 'TECHNICIAN' && profile.branchId == null) {
      return {
        message:
          'Debe estar asignado a un centro de servicio para registrar inspecciones anuales.',
      };
    }
    const serviceCenterId =
      profile.role === 'TECHNICIAN' ? await resolveServiceCenterId(profile) : null;
    return {
      ...baseActor(profile),
      ...(profile.role === 'ADMIN' ? manufacturerCompanyFields() : {}),
      serviceCenterId,
      distributorId: profile.distributorId,
    };
  }

  return {
    message:
      'No tiene permisos para registrar inspecciones anuales en el libro fiscal.',
  };
}
