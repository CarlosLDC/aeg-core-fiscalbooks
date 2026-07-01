import type { SealResponse } from '@/types/seal';

export function filterFiscalSeals(seals: SealResponse[], query: string): SealResponse[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return seals;
  return seals.filter(
    (seal) =>
      seal.serial.toLowerCase().includes(normalized) ||
      seal.color.toLowerCase().includes(normalized),
  );
}

export function formatFiscalSealLabel(seal: SealResponse): string {
  return `${seal.serial} (${seal.color})`;
}
