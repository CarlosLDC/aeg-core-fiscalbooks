import { describe, expect, it } from 'vitest';
import type { FiscalPrinter } from '@/lib/types';
import {
  filterPrintersBySearch,
  findExactSearchMatch,
  isBackendExactSearch,
  normalizeFiscalSearchTerm,
} from '@/lib/fiscal-book-search';

function printer(
  id: string,
  serial: string,
  rif: string | null = null,
): FiscalPrinter {
  return {
    id,
    id_modelo_impresora: '',
    id_sucursal: null,
    id_distribuidor: null,
    id_cliente: null,
    id_compra: null,
    id_software: null,
    id_firmware: null,
    serial_fiscal: serial,
    estatus: 'asignada',
    precio_venta_final: null,
    se_pago: null,
    tipo_dispositivo: 'interno',
    businessName: null,
    rif,
    taxpayerType: null,
    address: null,
    precintos: [],
    technicalReviews: [],
    annualInspections: [],
  };
}

describe('fiscal-book-search', () => {
  it('normalizes search terms to uppercase alphanumeric', () => {
    expect(normalizeFiscalSearchTerm('gra-0000123')).toBe('GRA0000123');
  });

  it('detects when the backend can handle the query as-is', () => {
    expect(isBackendExactSearch('GRA0000123', 'serial')).toBe(true);
    expect(isBackendExactSearch('GRA000', 'serial')).toBe(false);
    expect(isBackendExactSearch('J12345678', 'rif')).toBe(true);
    expect(isBackendExactSearch('J123', 'rif')).toBe(false);
  });

  it('ranks exact and prefix matches ahead of partial matches', () => {
    const printers = [
      printer('1', 'ZZZ9999999', 'J99999999'),
      printer('2', 'GRA0000999', 'J11111111'),
      printer('3', 'GRA0000123', 'J12345678'),
      printer('4', 'ABC0000123', 'J12340000'),
    ];

    const results = filterPrintersBySearch(printers, 'GRA', 'serial');
    expect(results.map((item) => item.id)).toEqual(['3', '2']);
  });

  it('prioritizes an exact serial match over other prefix matches', () => {
    const printers = [
      printer('1', 'GRA0000999', 'J11111111'),
      printer('2', 'GRA0000123', 'J12345678'),
    ];

    const results = filterPrintersBySearch(printers, 'GRA0000123', 'serial');
    expect(results.map((item) => item.id)).toEqual(['2']);
  });

  it('finds a single exact match for direct navigation', () => {
    const printers = [
      printer('1', 'GRA0000123', 'J12345678'),
      printer('2', 'GRA0000999', 'J12345678'),
    ];

    expect(findExactSearchMatch(printers, 'GRA0000123', 'serial')?.id).toBe('1');
    expect(findExactSearchMatch(printers, 'J12345678', 'rif')).toBeNull();
  });
});
