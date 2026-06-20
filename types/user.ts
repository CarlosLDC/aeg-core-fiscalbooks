export const ROLES = ['ADMIN', 'TECHNICIAN', 'SENIAT'] as const;

export type Role = (typeof ROLES)[number];
