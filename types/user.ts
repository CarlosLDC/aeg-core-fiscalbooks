export const ROLES = [
  'ADMIN',
  'DISTRIBUTOR',
  'TECHNICIAN',
  'SERVICE_CENTER',
  'SENIAT',
] as const;

export type Role = (typeof ROLES)[number];
