import { describe, expect, it } from 'vitest';
import {
  fiscalPrinterToMqttRef,
  isPrinterEligibleForAnnualInspectionMqtt,
} from '@/lib/annual-inspection-mqtt-state';
import type { FiscalPrinter } from '@/lib/types';

function basePrinter(overrides: Partial<FiscalPrinter> = {}): FiscalPrinter {
  return {
    id: '1',
    id_modelo_impresora: '1',
    id_sucursal: null,
    id_distribuidor: null,
    id_compra: null,
    id_software: null,
    id_firmware: null,
    serial_fiscal: 'GRA0000017',
    estatus: 'enajenada',
    precio_venta_final: null,
    se_pago: null,
    tipo_dispositivo: 'interno',
    direccion_mac: '20:6E:F1:88:4C:68',
    clientId: 10,
    businessName: null,
    rif: null,
    taxpayerType: null,
    address: null,
    precintos: [],
    technicalReviews: [],
    annualInspections: [],
    ...overrides,
  };
}

describe('annual-inspection-mqtt-state (fiscalbooks)', () => {
  it('maps FiscalPrinter to mqtt eligibility ref', () => {
    expect(fiscalPrinterToMqttRef(basePrinter())).toEqual({
      status: 'enajenada',
      clientId: 10,
      macAddress: '20:6E:F1:88:4C:68',
      fiscalSerial: 'GRA0000017',
    });
  });

  it('requires enajenada printer with client, serial and mac', () => {
    expect(isPrinterEligibleForAnnualInspectionMqtt(basePrinter())).toBe(true);
    expect(isPrinterEligibleForAnnualInspectionMqtt(basePrinter({ estatus: 'asignada' }))).toBe(
      false,
    );
    expect(isPrinterEligibleForAnnualInspectionMqtt(basePrinter({ clientId: null }))).toBe(false);
    expect(isPrinterEligibleForAnnualInspectionMqtt(basePrinter({ direccion_mac: '' }))).toBe(
      false,
    );
  });
});
