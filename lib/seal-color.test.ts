import { describe, expect, it } from 'vitest';
import { formatSealColor, sealColorMatchesQuery } from '@/lib/seal-color';

describe('formatSealColor', () => {
  it('maps known seal colors to natural language', () => {
    expect(formatSealColor('azul')).toBe('Azul');
    expect(formatSealColor('verde_neon')).toBe('Verde neón');
    expect(formatSealColor('VERDE_NEON')).toBe('Verde neón');
  });

  it('converts unknown snake_case values to natural language', () => {
    expect(formatSealColor('rojo_intenso')).toBe('Rojo intenso');
  });

  it('capitalizes simple color names', () => {
    expect(formatSealColor('amarillo')).toBe('Amarillo');
  });
});

describe('sealColorMatchesQuery', () => {
  it('matches both raw and formatted color text', () => {
    expect(sealColorMatchesQuery('verde_neon', 'verde neón')).toBe(true);
    expect(sealColorMatchesQuery('verde_neon', 'verde_neon')).toBe(true);
    expect(sealColorMatchesQuery('azul', 'azul')).toBe(true);
    expect(sealColorMatchesQuery('azul', 'rojo')).toBe(false);
  });
});
