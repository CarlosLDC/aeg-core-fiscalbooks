import { apiFetch } from '@/lib/api';
import { messageFromUnknownError } from '@/lib/api-error-message';

export type FiscalBookLookupInspectionByQrResponse = {
  inspectionId: number;
  printerId: number;
  fiscalSerial: string;
  registro: string;
  mac: string;
  fecha: string;
};

export async function lookupInspectionByQr(
  qrCodigo: string,
): Promise<FiscalBookLookupInspectionByQrResponse> {
  return apiFetch<FiscalBookLookupInspectionByQrResponse>(
    '/api/fiscal-books/lookup-inspection-by-qr',
    {
      method: 'POST',
      body: JSON.stringify({ qrCodigo }),
    },
  );
}

export function formatInspectionQrLookupDate(fecha: string): string {
  const trimmed = fecha.trim();
  if (!trimmed) return '—';

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  return parsed.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getQrLookupErrorMessage(error: unknown): string {
  return messageFromUnknownError(error);
}
