import { apiFetch } from '@/lib/api';
import type {
  TechnicalServiceRequest,
  TechnicalServiceResponse,
} from '@/types/technical-service';

const BASE = '/api/technical-services';

export async function createTechnicalService(
  body: TechnicalServiceRequest,
): Promise<TechnicalServiceResponse> {
  return apiFetch<TechnicalServiceResponse>(BASE, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
