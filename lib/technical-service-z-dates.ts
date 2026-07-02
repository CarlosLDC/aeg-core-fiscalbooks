import { parseLocalDateOnly, toIsoUtc, type ParseResult } from '@/lib/datetime-local';

const VENEZUELA_UTC_OFFSET_SECONDS = 4 * 3600;

/** Fecha de Reporte Z capturada manualmente (solo día, medianoche local). */
export function parseManualZReportDate(
  dateStr: string,
  fieldLabel: string,
): ParseResult {
  return parseLocalDateOnly(dateStr, fieldLabel);
}

export function manualZReportDateToIso(date: Date): string {
  return toIsoUtc(date);
}

/** Convierte timestamp UNIX venezolano (naive UTC-4) recibido por MQTT a ISO UTC. */
export function mqttZReportUnixToIso(unixSeconds: number): string {
  if (!Number.isFinite(unixSeconds)) {
    throw new Error('Timestamp UNIX del Reporte Z inválido.');
  }
  return new Date((unixSeconds + VENEZUELA_UTC_OFFSET_SECONDS) * 1000).toISOString();
}

/** Convierte ISO UTC almacenado a timestamp UNIX venezolano para publicación MQTT. */
export function isoToMqttZReportUnix(iso: string): number {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) {
    throw new Error('Fecha de Reporte Z inválida.');
  }
  return Math.floor(ms / 1000) - VENEZUELA_UTC_OFFSET_SECONDS;
}

function isLocalMidnight(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  );
}

/**
 * Muestra solo la fecha para captura manual (medianoche local).
 * Conserva fecha y hora cuando el valor proviene de MQTT con timestamp UNIX.
 */
export function formatZReportTimestamp(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    if (isLocalMidnight(date)) {
      return new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium' }).format(date);
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  } catch {
    return dateStr;
  }
}

/** Fecha de emisión del Reporte Z en formato YYYY-MM-DD (sin hora). */
export function formatZReportDateOnly(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr.split('T')[0] ?? dateStr;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  } catch {
    return dateStr.split('T')[0] ?? dateStr;
  }
}
