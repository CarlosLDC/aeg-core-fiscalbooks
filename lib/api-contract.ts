export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyEnvelopeMetadata(value: UnknownRecord, payloadKey: string): boolean {
  const metadataKeys = new Set([
    payloadKey,
    'message',
    'status',
    'statusCode',
    'success',
    'timestamp',
    'path',
  ]);
  return Object.keys(value).every((key) => metadataKeys.has(key));
}

export function unwrapApiPayload<T>(value: unknown): T {
  if (!isRecord(value)) return value as T;

  for (const key of ['data', 'result', 'payload'] as const) {
    if (key in value && hasOnlyEnvelopeMetadata(value, key)) {
      return value[key] as T;
    }
  }

  return value as T;
}

export function unwrapList<T>(value: unknown): T[] {
  const unwrapped = unwrapApiPayload<unknown>(value);
  if (Array.isArray(unwrapped)) return unwrapped as T[];

  if (isRecord(unwrapped)) {
    for (const key of ['items', 'content', 'results', 'data'] as const) {
      const maybeList = unwrapped[key];
      if (Array.isArray(maybeList)) return maybeList as T[];
    }
  }

  return [];
}

export function normalizePaginatedResponse<T>(
  value: unknown,
  pageFallback: number,
  pageSizeFallback: number,
): PaginatedResponse<T> {
  const unwrapped = unwrapApiPayload<unknown>(value);
  const source = isRecord(unwrapped) ? unwrapped : {};
  const items = unwrapList<T>(unwrapped);

  return {
    items,
    total:
      toNumber(source.total) ??
      toNumber(source.totalElements) ??
      toNumber(source.totalItems) ??
      toNumber(source.count) ??
      items.length,
    page:
      toNumber(source.page) ??
      toNumber(source.number) ??
      toNumber(source.currentPage) ??
      pageFallback,
    pageSize:
      toNumber(source.pageSize) ??
      toNumber(source.size) ??
      toNumber(source.limit) ??
      pageSizeFallback,
  };
}

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

export function toBooleanOrNull(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'si', 'sí'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  }
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
}

