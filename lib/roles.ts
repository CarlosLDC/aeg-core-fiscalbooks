import type { UserProfile } from '@/lib/auth-profile';
import {
  canCreateAnnualInspection,
  canCreateTechnicalService,
  canReadFiscalBook,
} from '@/lib/fiscal-permissions';
import type { Role } from '@/types/user';

/** Rol de UI alineado con permisos del libro fiscal */
export type RolUsuario = 'admin' | 'distribuidor' | 'tecnico' | 'seniat';

export type PerfilApp = {
  rol_usuario: RolUsuario | null;
  id_usuario: number | null;
  correo?: string | null;
};

export function roleToRolUsuario(role: Role | null | undefined): RolUsuario | null {
  if (!role) return null;
  switch (role) {
    case 'ADMIN':
      return 'admin';
    case 'DISTRIBUTOR':
      return 'distribuidor';
    case 'SENIAT':
      return 'seniat';
    case 'TECHNICIAN':
      return 'tecnico';
    default:
      return null;
  }
}

export function profileToPerfilApp(profile: UserProfile | null): PerfilApp | null {
  if (!profile) return null;
  return {
    rol_usuario: roleToRolUsuario(profile.role),
    id_usuario: profile.userId,
    correo: profile.email,
  };
}

export function isTecnico(profile: PerfilApp | null | undefined): boolean {
  return profile?.rol_usuario === 'tecnico';
}

export function isDistribuidor(profile: PerfilApp | null | undefined): boolean {
  return profile?.rol_usuario === 'distribuidor';
}

export function isAdmin(profile: PerfilApp | null | undefined): boolean {
  return profile?.rol_usuario === 'admin';
}

export function isAdminOrSeniat(profile: PerfilApp | null | undefined): boolean {
  const r = profile?.rol_usuario;
  return r === 'admin' || r === 'seniat';
}

/** @deprecated Use canCreateTechnicalService or canCreateAnnualInspection */
export function canRegistrarServiciosEInspecciones(
  profile: PerfilApp | null | undefined,
): boolean {
  return isTecnico(profile);
}

export function rolUsuarioLabel(rol: RolUsuario | null | undefined): string | null {
  switch (rol) {
    case 'admin':
      return 'Administrador';
    case 'distribuidor':
      return 'Distribuidor';
    case 'seniat':
      return 'SENIAT';
    case 'tecnico':
      return 'Técnico (centro de servicio)';
    default:
      return null;
  }
}

export function canWriteFiscalBook(profile: UserProfile | null | undefined): boolean {
  return canReadFiscalBook(profile?.role);
}

export { canCreateAnnualInspection, canCreateTechnicalService, canReadFiscalBook };
