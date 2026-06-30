import type { AnnualInspection } from '@/lib/types';

export type AnnualInspectionQrVerification = {
  qrCodigo: string;
  registro: string;
  mac: string;
  fecha: string;
};

export type AnnualInspectionVerifyQrResponse = {
  valido: boolean;
  registro: string;
  mac: string;
  fecha: string;
};

export function hasAnnualInspectionQrProof(
  inspection: Pick<
    AnnualInspection,
    'mqttQrRegistro' | 'mqttQrMac' | 'mqttQrFecha' | 'mqttQrCodigo'
  >,
): boolean {
  return (
    Boolean(inspection.mqttQrRegistro?.trim()) ||
    Boolean(inspection.mqttQrMac?.trim()) ||
    Boolean(inspection.mqttQrFecha?.trim()) ||
    Boolean(inspection.mqttQrCodigo?.trim())
  );
}

export function truncateQrCodigo(value: string | null | undefined, max = 24): string {
  if (!value?.trim()) return '—';
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}
