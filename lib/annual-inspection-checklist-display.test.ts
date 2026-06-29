import { describe, expect, it } from 'vitest';
import {
  annualInspectionChecklistRows,
  hasAnnualInspectionChecklistDisplay,
} from '@/lib/annual-inspection-checklist-display';
import type { AnnualInspection } from '@/lib/types';

const baseInspection: AnnualInspection = {
  id: '1',
  date: '2026-01-01',
  serviceCenter: 'Centro',
  centerRif: 'J-1',
  inspector: 'Inspector',
  status: 'passed',
  observations: '',
  precintoViolentado: false,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('annualInspectionChecklistRows', () => {
  it('infers precinto from legacy precintoViolentado', () => {
    const rows = annualInspectionChecklistRows({
      ...baseInspection,
      precintoViolentado: true,
    });
    expect(rows.find((row) => row.label === 'Estado del Precinto')?.value).toBe(
      'Violentado',
    );
  });

  it('shows persisted checklist values', () => {
    const rows = annualInspectionChecklistRows({
      ...baseInspection,
      chkPrecinto: true,
      chkEtiquetaFiscal: true,
      chkFactura: false,
      chkNotaCredito: true,
      chkSensorPapel: true,
    });
    expect(rows.find((row) => row.label === 'Estado de la Factura')?.value).toBe(
      'Defectuoso',
    );
  });
});

describe('hasAnnualInspectionChecklistDisplay', () => {
  it('detects persisted checklist and mqtt audit', () => {
    expect(hasAnnualInspectionChecklistDisplay(baseInspection)).toBe(true);
    expect(
      hasAnnualInspectionChecklistDisplay({
        ...baseInspection,
        precintoViolentado: undefined,
        chkPrecinto: true,
      }),
    ).toBe(true);
    expect(
      hasAnnualInspectionChecklistDisplay({
        ...baseInspection,
        precintoViolentado: undefined,
        mqttRegistroImpresora: 'GRA0000017',
      }),
    ).toBe(true);
  });
});
