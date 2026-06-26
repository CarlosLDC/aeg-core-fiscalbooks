import type { FiscalPrinter } from '@/lib/types';
import {
  isPrinterEligibleForAnnualInspectionMqtt as isEligibleRef,
  type AnnualInspectionMqttPrinterRef,
} from '@aeg/annual-inspection-mqtt';

export * from '@aeg/annual-inspection-mqtt';

export function fiscalPrinterToMqttRef(printer: FiscalPrinter): AnnualInspectionMqttPrinterRef {
  return {
    status: printer.estatus,
    clientId: printer.clientId,
    macAddress: printer.direccion_mac ?? null,
    fiscalSerial: printer.serial_fiscal ?? null,
  };
}

export function isPrinterEligibleForAnnualInspectionMqtt(printer: FiscalPrinter): boolean {
  return isEligibleRef(fiscalPrinterToMqttRef(printer));
}
