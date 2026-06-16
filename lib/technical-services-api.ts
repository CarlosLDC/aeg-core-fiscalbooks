import { apiFetch } from '@/lib/api';
import { toNumber, unwrapApiPayload } from '@/lib/api-contract';
import type {
  TechnicalServiceRequest,
  TechnicalServiceResponse,
} from '@/types/technical-service';

const BASE = '/api/technical-services';

export async function createTechnicalService(
  body: TechnicalServiceRequest,
): Promise<TechnicalServiceResponse> {
  const response = await apiFetch<unknown>(BASE, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const created =
    unwrapApiPayload<TechnicalServiceResponse | undefined>(response) ??
    ({} as TechnicalServiceResponse);
  const record = created as TechnicalServiceResponse & {
    serviceId?: unknown;
    technicalServiceId?: unknown;
    technical_service_id?: unknown;
    printer_id?: unknown;
    technician_id?: unknown;
  };

  return {
    ...created,
    id:
      toNumber(record.id) ??
      toNumber(record.serviceId) ??
      toNumber(record.technicalServiceId) ??
      toNumber(record.technical_service_id) ??
      0,
    printerId: toNumber(record.printerId) ?? toNumber(record.printer_id) ?? body.printerId,
    technicianId:
      toNumber(record.technicianId) ?? toNumber(record.technician_id) ?? body.technicianId,
  };
}
