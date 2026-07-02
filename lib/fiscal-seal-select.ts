import type { SealResponse } from '@/types/seal';
import { formatSealColor, sealColorMatchesQuery } from '@/lib/seal-color';

export const FISCAL_SEAL_SEARCH_LIMIT = 50;

export function filterFiscalSeals(
  seals: SealResponse[],
  query: string,
  limit = FISCAL_SEAL_SEARCH_LIMIT,
): SealResponse[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return seals
    .filter(
      (seal) =>
        seal.serial.toLowerCase().includes(normalized) ||
        sealColorMatchesQuery(seal.color, normalized),
    )
    .slice(0, limit);
}

export function countFiscalSealMatches(seals: SealResponse[], query: string): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 0;
  return seals.filter(
    (seal) =>
      seal.serial.toLowerCase().includes(normalized) ||
      sealColorMatchesQuery(seal.color, normalized),
  ).length;
}

export function formatFiscalSealLabel(seal: SealResponse): string {
  return `${seal.serial} (${formatSealColor(seal.color)})`;
}
