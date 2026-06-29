import { describe, expect, it } from 'vitest';
import {
  printerEstatusBadgeClass,
  printerEstatusLabel,
} from '@/lib/printer-status';

describe('printer-status', () => {
  it('labels en consignacion', () => {
    expect(printerEstatusLabel('en_consignacion')).toBe('En consignación');
  });

  it('styles en consignacion distinctly from asignada', () => {
    expect(printerEstatusBadgeClass('en_consignacion')).toContain('indigo');
    expect(printerEstatusBadgeClass('asignada')).toContain('emerald');
  });
});
