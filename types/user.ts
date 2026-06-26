export const ROLES = ['ADMIN', 'DISTRIBUTOR', 'TECHNICIAN', 'SENIAT'] as const;

export type Role = (typeof ROLES)[number];
