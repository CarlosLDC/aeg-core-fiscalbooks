/** Empresa fabricante (administrador AEG) en servicios e inspecciones sin centro de servicio. */
export const MANUFACTURER_COMPANY_NAME = 'ALPHA ENGINEER GROUP, C.A.';
export const MANUFACTURER_COMPANY_RIF = 'J504594369';

export function manufacturerCompanyFields(): {
  companyName: string;
  companyRif: string;
} {
  return {
    companyName: MANUFACTURER_COMPANY_NAME,
    companyRif: MANUFACTURER_COMPANY_RIF,
  };
}

export function formatManufacturerCompanyDisplay(): string {
  return `${MANUFACTURER_COMPANY_NAME} — RIF ${MANUFACTURER_COMPANY_RIF}`;
}

export function withManufacturerCompanyFallback(
  serviceCenter: string | null | undefined,
  centerRif: string | null | undefined,
): { serviceCenter: string | null; centerRif: string | null } {
  const name = serviceCenter?.trim() || null;
  const rif = centerRif?.trim() || null;
  if (name || rif) {
    return { serviceCenter: name, centerRif: rif };
  }
  return {
    serviceCenter: MANUFACTURER_COMPANY_NAME,
    centerRif: MANUFACTURER_COMPANY_RIF,
  };
}
