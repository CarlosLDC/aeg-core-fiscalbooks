import { apiFetch } from '@/lib/api';
import { toNumber, unwrapApiPayload } from '@/lib/api-contract';
import type {
  AnnualInspectionRequest,
  AnnualInspectionResponse,
} from '@/types/annual-inspection';

const BASE = '/api/annual-inspections';

export async function createAnnualInspection(
  body: AnnualInspectionRequest,
): Promise<AnnualInspectionResponse> {
  const response = await apiFetch<unknown>(BASE, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const created =
    unwrapApiPayload<AnnualInspectionResponse | undefined>(response) ??
    ({} as AnnualInspectionResponse);
  const record = created as AnnualInspectionResponse & {
    inspectionId?: unknown;
    annualInspectionId?: unknown;
    annual_inspection_id?: unknown;
    printer_id?: unknown;
    user_id?: unknown;
  };

  return {
    ...created,
    id:
      toNumber(record.id) ??
      toNumber(record.inspectionId) ??
      toNumber(record.annualInspectionId) ??
      toNumber(record.annual_inspection_id) ??
      0,
    printerId: toNumber(record.printerId) ?? toNumber(record.printer_id) ?? body.printerId,
    userId: toNumber(record.userId) ?? toNumber(record.user_id) ?? body.userId,
  };
}
