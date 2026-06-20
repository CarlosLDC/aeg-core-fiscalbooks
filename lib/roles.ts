import type { UserProfile } from '@/lib/auth-profile';
import type { Role } from '@/types/user';

/** Rol de UI alineado con permisos del libro fiscal */
export type RolUsuario = 'admin' | 'tecnico' | 'seniat';

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

export function isAdmin(profile: PerfilApp | null | undefined): boolean {
  return profile?.rol_usuario === 'admin';
}

export function isAdminOrSeniat(profile: PerfilApp | null | undefined): boolean {
  const r = profile?.rol_usuario;
  return r === 'admin' || r === 'seniat';
}

export function canRegistrarServiciosEInspecciones(
  profile: PerfilApp | null | undefined,
): boolean {
  return isTecnico(profile) || isAdmin(profile);
}

export function rolUsuarioLabel(rol: RolUsuario | null | undefined): string | null {
  switch (rol) {
    case 'admin':
      return 'Administrador';
    case 'seniat':
      return 'SENIAT';
    case 'tecnico':
      return 'Técnico';
    default:
      return null;
  }
}

export function canWriteFiscalBook(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === 'TECHNICIAN' || profile.role === 'ADMIN';
}
