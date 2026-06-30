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

export function getQrLookupErrorMessage(error: unknown): string {
  return messageFromUnknownError(error);
}
