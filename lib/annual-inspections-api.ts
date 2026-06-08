import { apiFetch } from '@/lib/api';
import type {
  AnnualInspectionRequest,
  AnnualInspectionResponse,
} from '@/types/annual-inspection';

const BASE = '/api/annual-inspections';

export async function createAnnualInspection(
  body: AnnualInspectionRequest,
): Promise<AnnualInspectionResponse> {
  return apiFetch<AnnualInspectionResponse>(BASE, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
