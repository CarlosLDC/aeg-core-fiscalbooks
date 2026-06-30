import { apiFetch } from '@/lib/api';
import { messageFromUnknownError } from '@/lib/api-error-message';
import type {
  AnnualInspectionStaInfResponse,
  AnnualInspectionSubmitResponse,
  AnnualInspectionTestCreditNoteResponse,
  AnnualInspectionTestInvoiceResponse,
} from '@/types/annual-inspection-mqtt';
import type { AnnualInspectionVerifyQrResponse } from '@/lib/annual-inspection-qr-display';

const BASE = '/api/mqtt/annual-inspection';

export function getAnnualInspectionMqttErrorMessage(error: unknown): string {
  return messageFromUnknownError(error);
}

export async function requestAnnualInspectionStaInf(input: {
  printerId: number;
}): Promise<AnnualInspectionStaInfResponse> {
  return apiFetch<AnnualInspectionStaInfResponse>(`${BASE}/sta-inf`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
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

export async function verifyAnnualInspectionQr(input: {
  printerId: number;
  qrCodigo: string;
  registroImpresora: string;
}): Promise<AnnualInspectionVerifyQrResponse> {
  return apiFetch(`${BASE}/verify-qr`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
