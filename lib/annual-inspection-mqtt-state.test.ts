import { describe, expect, it } from 'vitest';
import {
  applyFailedTestInvoice,
  applySuccessfulTestInvoice,
  canSendAnnualInspectionTestCreditNote,
  createAnnualInspectionMqttFlowState,
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

describe('annual-inspection-mqtt-state', () => {
  it('requires enajenada printer with serial and mac', () => {
    expect(isPrinterEligibleForAnnualInspectionMqtt(basePrinter())).toBe(true);
    expect(isPrinterEligibleForAnnualInspectionMqtt(basePrinter({ estatus: 'asignada' }))).toBe(
      false,
    );
    expect(isPrinterEligibleForAnnualInspectionMqtt(basePrinter({ direccion_mac: '' }))).toBe(
      false,
    );
  });

  it('blocks credit note until invoice number exists', () => {
    const flow = createAnnualInspectionMqttFlowState({
      registroImpresora: 'GRA0000017',
      fiscalSerial: 'GRA0000017',
      printerId: 1,
    });
    expect(canSendAnnualInspectionTestCreditNote(flow)).toBe(false);
    expect(canSendAnnualInspectionTestCreditNote(applySuccessfulTestInvoice(flow, 7))).toBe(true);
  });

  it('clears invoice prerequisites on failure', () => {
    const flow = applySuccessfulTestInvoice(
      createAnnualInspectionMqttFlowState({
        registroImpresora: 'GRA0000017',
        fiscalSerial: 'GRA0000017',
        printerId: 1,
      }),
      7,
    );
    flow.checklist.chkNotaCredito = true;
    const next = applyFailedTestInvoice(flow);
    expect(next.numeroFacturaPrueba).toBeNull();
    expect(next.checklist.chkFactura).toBe(false);
    expect(next.checklist.chkNotaCredito).toBe(false);
  });
});
