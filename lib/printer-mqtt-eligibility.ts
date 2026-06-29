import { isPrinterEligibleForAnnualInspectionMqtt } from '@aeg/annual-inspection-mqtt';
import type { FiscalPrinter } from '@/lib/types';

export function fiscalPrinterToMqttRef(printer: FiscalPrinter) {
  return {
    status: printer.estatus,
    clientId: printer.id_cliente,
    macAddress: printer.direccion_mac,
    fiscalSerial: printer.serial_fiscal,
  };
}

export function isFiscalPrinterEligibleForAnnualInspectionMqtt(
  printer: FiscalPrinter,
): boolean {
  return isPrinterEligibleForAnnualInspectionMqtt(fiscalPrinterToMqttRef(printer));
}

export function annualInspectionMqttEligibilityReason(
  printer: FiscalPrinter,
): string | null {
  if (printer.estatus !== 'enajenada') {
    return 'La impresora debe estar en estatus enajenada.';
  }
  if (!printer.id_cliente) {
    return 'La impresora debe tener un cliente asignado.';
  }
  if (!printer.serial_fiscal?.trim()) {
    return 'La impresora debe tener serial fiscal.';
  }
  if (!printer.direccion_mac?.trim()) {
    return 'La impresora debe tener dirección MAC configurada.';
  }
  return null;
}
