import { apiFetch } from '@/lib/api';
import { toNumber, toStringOrNull, unwrapList } from '@/lib/api-contract';
import type { SealResponse } from '@/types/seal';

const BASE = '/api/seals';

function normalizeSealStatus(status: unknown): string {
  const normalized = toStringOrNull(status)?.toLowerCase().replace(/-/g, '_');
  if (normalized === 'available') return 'disponible';
  if (normalized === 'installed' || normalized === 'in_printer') return 'en_impresora';
  if (normalized === 'replaced' || normalized === 'removed') return 'sustituido';
  return normalized ?? '';
}

function normalizeSeal(seal: SealResponse): SealResponse {
  const record = seal as SealResponse & {
    printer_id?: unknown;
    installation_date?: unknown;
    removal_date?: unknown;
    created_at?: unknown;
  };
  return {
    ...seal,
    id: toNumber(seal.id) ?? seal.id,
    printerId: toNumber(seal.printerId) ?? toNumber(record.printer_id),
    serial: toStringOrNull(seal.serial) ?? '',
    installationDate:
      toStringOrNull(seal.installationDate) ?? toStringOrNull(record.installation_date),
    removalDate: toStringOrNull(seal.removalDate) ?? toStringOrNull(record.removal_date),
    color: toStringOrNull(seal.color) ?? '',
    status: normalizeSealStatus(seal.status),
    createdAt: toStringOrNull(seal.createdAt) ?? toStringOrNull(record.created_at) ?? '',
  };
}

export async function fetchSeals(): Promise<SealResponse[]> {
  const response = await apiFetch<unknown>(BASE);
  return unwrapList<SealResponse>(response).map(normalizeSeal);
}
