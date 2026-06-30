import type { FiscalPrinter } from '@/lib/types';

export type FiscalBookSearchType = 'serial' | 'rif';

const EXACT_SERIAL_PATTERN = /^[A-Z]{3}[0-9]{7}$/;
const EXACT_RIF_PATTERN = /^[VEJPG][0-9]{7,9}$/;

export const MIN_PARTIAL_SEARCH_LENGTH = 2;

export function normalizeFiscalSearchTerm(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function normalizeRif(value: string): string {
  return normalizeFiscalSearchTerm(value);
}

export function isExactSerialSearch(term: string): boolean {
  return EXACT_SERIAL_PATTERN.test(term);
}

export function isExactRifSearch(term: string): boolean {
  return EXACT_RIF_PATTERN.test(term);
}

export function isBackendExactSearch(
  term: string,
  searchType: FiscalBookSearchType,
): boolean {
  if (!term) return true;
  return searchType === 'serial' ? isExactSerialSearch(term) : isExactRifSearch(term);
}

function normalizedSerial(printer: FiscalPrinter): string {
  return normalizeFiscalSearchTerm(printer.serial_fiscal ?? '');
}

function normalizedPrinterRif(printer: FiscalPrinter): string {
  return normalizeRif(printer.rif ?? '');
}

function fieldValue(printer: FiscalPrinter, searchType: FiscalBookSearchType): string {
  return searchType === 'serial'
    ? normalizedSerial(printer)
    : normalizedPrinterRif(printer);
}

function relevanceScore(value: string, term: string): number {
  if (!value || !term) return -1;
  if (value === term) return 300;
  if (value.startsWith(term)) return 200;
  if (value.includes(term)) return 100;
  return -1;
}

export function filterPrintersBySearch(
  printers: FiscalPrinter[],
  term: string,
  searchType: FiscalBookSearchType,
): FiscalPrinter[] {
  const normalizedTerm = normalizeFiscalSearchTerm(term);
  if (!normalizedTerm) return printers;

  return printers
    .map((printer) => ({
      printer,
      score: relevanceScore(fieldValue(printer, searchType), normalizedTerm),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aValue = fieldValue(a.printer, searchType);
      const bValue = fieldValue(b.printer, searchType);
      return aValue.localeCompare(bValue);
    })
    .map((entry) => entry.printer);
}

export function findExactSearchMatch(
  printers: FiscalPrinter[],
  term: string,
  searchType: FiscalBookSearchType,
): FiscalPrinter | null {
  const normalizedTerm = normalizeFiscalSearchTerm(term);
  if (!normalizedTerm) return null;

  const exactMatches = printers.filter(
    (printer) => fieldValue(printer, searchType) === normalizedTerm,
  );

  return exactMatches.length === 1 ? exactMatches[0] : null;
}

export function paginatePrinters(
  printers: FiscalPrinter[],
  page: number,
  pageSize: number,
): FiscalPrinter[] {
  const safePage = Math.max(page, 1);
  const safeSize = Math.max(pageSize, 1);
  const start = (safePage - 1) * safeSize;
  return printers.slice(start, start + safeSize);
}
