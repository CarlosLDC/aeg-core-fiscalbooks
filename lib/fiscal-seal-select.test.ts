import { describe, expect, it } from 'vitest';
import { filterFiscalSeals } from '@/lib/fiscal-seal-select';
import type { SealResponse } from '@/types/seal';

function seal(id: number, serial: string, color: string): SealResponse {
  return {
    id,
    printerId: null,
    serial,
    installationDate: null,
    removalDate: null,
    color,
    status: 'disponible',
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('filterFiscalSeals', () => {
  const seals = [
    seal(1, 'ABC12345', 'Rojo'),
    seal(2, 'XYZ98765', 'Azul'),
    seal(3, 'GRA00001', 'Verde'),
  ];

  it('returns all seals when the query is empty', () => {
    expect(filterFiscalSeals(seals, '')).toHaveLength(3);
  });

  it('filters by serial or color', () => {
    expect(filterFiscalSeals(seals, 'gra').map((item) => item.id)).toEqual([3]);
    expect(filterFiscalSeals(seals, 'azul').map((item) => item.id)).toEqual([2]);
  });
});
