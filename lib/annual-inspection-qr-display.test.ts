import { describe, expect, it } from 'vitest';
import {
  hasAnnualInspectionQrProof,
  truncateQrCodigo,
} from '@/lib/annual-inspection-qr-display';

describe('annual-inspection-qr-display', () => {
  it('detects persisted QR proof fields', () => {
    expect(
      hasAnnualInspectionQrProof({
        mqttQrCodigo: null,
        mqttQrRegistro: 'GRA0000017',
        mqttQrMac: null,
        mqttQrFecha: null,
      }),
    ).toBe(true);
  });

  it('truncates long QR codes for display', () => {
    expect(truncateQrCodigo('abcdefghijklmnopqrstuvwxyz', 10)).toBe('abcdefghij…');
  });
});
