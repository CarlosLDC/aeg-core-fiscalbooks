export const PRINTER_ESTATUS_VALUES = [
  'de_fabrica',
  'sin_asignar',
  'asignada',
  'en_consignacion',
  'enajenada',
  'desincorporada',
  'laboratorio',
] as const;

export type PrinterEstatus = (typeof PRINTER_ESTATUS_VALUES)[number];

const PRINTER_ESTATUS_LABELS: Record<PrinterEstatus, string> = {
  de_fabrica: 'De fábrica',
  sin_asignar: 'Sin asignar',
  asignada: 'Asignada',
  en_consignacion: 'En consignación',
  enajenada: 'Activa',
  desincorporada: 'Retirada',
  laboratorio: 'Laboratorio',
};

const PRINTER_ESTATUS_BADGE_CLASS: Record<PrinterEstatus, string> = {
  de_fabrica:
    'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/30',
  sin_asignar:
    'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/30',
  asignada:
    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
  en_consignacion:
    'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30',
  enajenada:
    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
  desincorporada:
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  laboratorio:
    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
};

export function normalizePrinterEstatus(
  value: string | null | undefined,
): PrinterEstatus | string {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return 'asignada';
  if (normalized === 'inicializada') return 'sin_asignar';
  if (normalized === 'de_demostracion') return 'laboratorio';
  if ((PRINTER_ESTATUS_VALUES as readonly string[]).includes(normalized)) {
    return normalized as PrinterEstatus;
  }
  return normalized;
}

export function printerEstatusLabel(value: string | null | undefined): string {
  const normalized = normalizePrinterEstatus(value);
  if ((PRINTER_ESTATUS_VALUES as readonly string[]).includes(normalized)) {
    return PRINTER_ESTATUS_LABELS[normalized as PrinterEstatus];
  }
  return normalized.replaceAll('_', ' ');
}

export function printerEstatusBadgeClass(value: string | null | undefined): string {
  const normalized = normalizePrinterEstatus(value);
  if ((PRINTER_ESTATUS_VALUES as readonly string[]).includes(normalized)) {
    return PRINTER_ESTATUS_BADGE_CLASS[normalized as PrinterEstatus];
  }
  return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
}

/** Solo equipos enajenados o desincorporados aparecen en el libro fiscal. */
export function isFiscalBookListedPrinter(
  value: string | null | undefined,
): boolean {
  const normalized = normalizePrinterEstatus(value);
  return normalized === 'enajenada' || normalized === 'desincorporada';
}

export type PrinterListingFilter = 'all' | 'activa' | 'retirada';

export function filterPrintersByListingStatus<T extends { estatus: string }>(
  printers: T[],
  filter: PrinterListingFilter,
): T[] {
  if (filter === 'all') return printers;
  if (filter === 'activa') {
    return printers.filter(
      (printer) => normalizePrinterEstatus(printer.estatus) === 'enajenada',
    );
  }
  return printers.filter(
    (printer) => normalizePrinterEstatus(printer.estatus) === 'desincorporada',
  );
}
