import { describe, expect, it } from 'vitest';
import {
  isFiscalBookListedPrinter,
  printerEstatusBadgeClass,
  printerEstatusLabel,
  filterPrintersByListingStatus,
} from '@/lib/printer-status';

describe('printer-status', () => {
  it('labels en consignacion', () => {
    expect(printerEstatusLabel('en_consignacion')).toBe('En consignación');
  });

  it('labels fiscal book statuses for contributors', () => {
    expect(printerEstatusLabel('enajenada')).toBe('Activo');
    expect(printerEstatusLabel('desincorporada')).toBe('Retirado');
  });

  it('styles en consignacion distinctly from asignada', () => {
    expect(printerEstatusBadgeClass('en_consignacion')).toContain('indigo');
    expect(printerEstatusBadgeClass('asignada')).toContain('emerald');
  });

  it('styles fiscal book active and retired badges', () => {
    expect(printerEstatusBadgeClass('enajenada')).toContain('emerald');
    expect(printerEstatusBadgeClass('desincorporada')).toContain('slate');
  });

  it('lists only enajenada and desincorporada printers in fiscal books', () => {
    expect(isFiscalBookListedPrinter('enajenada')).toBe(true);
    expect(isFiscalBookListedPrinter('desincorporada')).toBe(true);
    expect(isFiscalBookListedPrinter('asignada')).toBe(false);
    expect(isFiscalBookListedPrinter('laboratorio')).toBe(false);
  });

  it('filters listed printers by activa and retirada', () => {
    const printers = [
      { id: '1', estatus: 'enajenada' },
      { id: '2', estatus: 'desincorporada' },
      { id: '3', estatus: 'enajenada' },
    ];

    expect(filterPrintersByListingStatus(printers, 'all')).toHaveLength(3);
    expect(filterPrintersByListingStatus(printers, 'activa').map((p) => p.id)).toEqual([
      '1',
      '3',
    ]);
    expect(filterPrintersByListingStatus(printers, 'retirada').map((p) => p.id)).toEqual(['2']);
  });
});
