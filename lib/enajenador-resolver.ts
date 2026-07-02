import type { FiscalBookBranchResponse } from '@/types/fiscal-book';
import {
  MANUFACTURER_COMPANY_NAME,
  MANUFACTURER_COMPANY_RIF,
} from '@/lib/manufacturer-company';
import type { Sucursal } from '@/lib/types';

/** Sucursal del enajenador para la sección 2 del libro fiscal. */
export function resolveEnajenadorSucursal(
  enajenador: FiscalBookBranchResponse | null | undefined,
  distributorBranch: FiscalBookBranchResponse | null | undefined,
): Sucursal | null {
  const branch = enajenador ?? distributorBranch ?? null;
  if (!branch) return null;

  const company = branch.company;
  return {
    id: branch.id,
    id_empresa: branch.companyId,
    ciudad: branch.city ?? '',
    estado: branch.state ?? '',
    direccion: branch.address ?? null,
    telefono: branch.phone ?? null,
    correo: branch.email ?? null,
    es_cliente: branch.isClient ?? false,
    es_distribuidora: branch.isDistributor ?? false,
    es_centro_servicio: branch.isServiceCenter ?? false,
    company: company
      ? {
          id: company.id,
          razon_social: company.businessName ?? '',
          rif: company.rif ?? '',
          tipo_contribuyente: company.contributorType ?? '',
        }
      : {
          id: 0,
          razon_social: MANUFACTURER_COMPANY_NAME,
          rif: MANUFACTURER_COMPANY_RIF,
          tipo_contribuyente: 'ordinario',
        },
  };
}
