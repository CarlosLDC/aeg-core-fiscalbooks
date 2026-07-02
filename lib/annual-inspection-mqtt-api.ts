import { apiFetch } from '@/lib/api';
import { messageFromUnknownError } from '@/lib/api-error-message';
import { ANNUAL_INSPECTION_MISSING_MAC_MESSAGE } from '@/lib/annual-inspection-mqtt-state';
import { withTimeout } from '@/lib/timeout';
import { ApiError } from '@/types/auth';
import type {
  AnnualInspectionStaInfResponse,
  AnnualInspectionSubmitResponse,
  AnnualInspectionTestCreditNoteResponse,
  AnnualInspectionTestInvoiceResponse,
} from '@/types/annual-inspection-mqtt';

const BASE = '/api/mqtt/annual-inspection';

/** Red de seguridad si el servidor o el proxy no responden (el backend corta MQTT ~1 s). */
export const ANNUAL_INSPECTION_STA_INF_SAFETY_TIMEOUT_MS = 30_000;

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

function mapAnnualInspectionOperationalError(error: unknown): string | null {
  const message = messageFromUnknownError(error).toLowerCase();
  if (message.includes('mac') || message.includes('dirección mac')) {
    return ANNUAL_INSPECTION_MISSING_MAC_MESSAGE;
  }
  return null;
}

export function getAnnualInspectionMqttErrorMessage(error: unknown): string {
  return mapAnnualInspectionOperationalError(error) ?? messageFromUnknownError(error);
}

export function getAnnualInspectionStaInfErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return 'Sesión expirada. Vuelva a iniciar sesión.';
  }

  const mapped = mapAnnualInspectionOperationalError(error);
  if (mapped) return mapped;

  if (isPrinterQueryTimeout(error)) {
    return ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE;
  }

  return ANNUAL_INSPECTION_PRINTER_QUERY_ERROR_MESSAGE;
}

export async function requestAnnualInspectionStaInf(input: {
  printerId: number;
}): Promise<AnnualInspectionStaInfResponse> {
  return withTimeout(
    apiFetch<AnnualInspectionStaInfResponse>(`${BASE}/sta-inf`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
    ANNUAL_INSPECTION_STA_INF_SAFETY_TIMEOUT_MS,
    ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE,
  );
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
