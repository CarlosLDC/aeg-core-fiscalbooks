import { describe, expect, it } from 'vitest';
import { mergeTechnicalServiceDescription } from '@/lib/technical-service-description';

describe('mergeTechnicalServiceDescription', () => {
  it('devuelve solo la falla cuando no hay observaciones', () => {
    expect(mergeTechnicalServiceDescription('Papel atascado', null)).toBe('Papel atascado');
  });

  it('combina falla y observaciones distintas', () => {
    expect(
      mergeTechnicalServiceDescription('Papel atascado', 'Se limpió el rodillo'),
    ).toBe('Papel atascado\n\nSe limpió el rodillo');
  });

  it('evita duplicar texto idéntico', () => {
    expect(mergeTechnicalServiceDescription('Mismo texto', 'Mismo texto')).toBe('Mismo texto');
  });
});
