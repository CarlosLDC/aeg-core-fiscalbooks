import { apiFetch } from '@/lib/api';
import { messageFromUnknownError } from '@/lib/api-error-message';
import type {
  AnnualInspectionStaInfResponse,
  AnnualInspectionSubmitResponse,
  AnnualInspectionTestCreditNoteResponse,
  AnnualInspectionTestInvoiceResponse,
} from '@/types/annual-inspection-mqtt';

const BASE = '/api/mqtt/annual-inspection';

export const ANNUAL_INSPECTION_STA_INF_TIMEOUT_MS = 1000;

export const ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE =
  'La impresora no respondió a tiempo. Verifique que esté encendida y conectada a la red, e intente nuevamente.';

export const ANNUAL_INSPECTION_PRINTER_QUERY_ERROR_MESSAGE =
  'No se pudo consultar la impresora. Verifique que esté encendida y conectada a la red, e intente nuevamente.';

function isPrinterQueryTimeout(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  const message = messageFromUnknownError(error).toLowerCase();
  return (
    message.includes('tiempo de espera') ||
    message.includes('no respondió') ||
    message.includes('timeout') ||
    message.includes('abort')
  );
}

export function getAnnualInspectionMqttErrorMessage(error: unknown): string {
  return messageFromUnknownError(error);
}

export function getAnnualInspectionStaInfErrorMessage(error: unknown): string {
  if (isPrinterQueryTimeout(error)) {
    return ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE;
  }

  return ANNUAL_INSPECTION_PRINTER_QUERY_ERROR_MESSAGE;
}

export async function requestAnnualInspectionStaInf(input: {
  printerId: number;
}): Promise<AnnualInspectionStaInfResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANNUAL_INSPECTION_STA_INF_TIMEOUT_MS);

  try {
    return await apiFetch<AnnualInspectionStaInfResponse>(`${BASE}/sta-inf`, {
      method: 'POST',
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestAnnualInspectionTestInvoice(input: {
  printerId: number;
  productDescription?: string;
}): Promise<AnnualInspectionTestInvoiceResponse> {
  return apiFetch<AnnualInspectionTestInvoiceResponse>(`${BASE}/test-invoice`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function requestAnnualInspectionTestCreditNote(input: {
  printerId: number;
  numeroFacturaPrueba: number;
  registroImpresora: string;
  productDescription?: string;
}): Promise<AnnualInspectionTestCreditNoteResponse> {
  return apiFetch<AnnualInspectionTestCreditNoteResponse>(`${BASE}/test-credit-note`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function submitAnnualInspectionMqtt(input: {
  printerId: number;
  chkPrecinto: boolean;
  chkEtiquetaFiscal: boolean;
  chkFactura: boolean;
  chkNotaCredito: boolean;
  chkSensorPapel: boolean;
}): Promise<AnnualInspectionSubmitResponse> {
  return apiFetch<AnnualInspectionSubmitResponse>(`${BASE}/submit`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
