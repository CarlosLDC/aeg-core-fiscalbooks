import { describe, expect, it } from 'vitest';
import { resolveEnajenadorSucursal } from '@/lib/enajenador-resolver';
import {
  MANUFACTURER_COMPANY_NAME,
  MANUFACTURER_COMPANY_RIF,
} from '@/lib/manufacturer-company';
import type { FiscalBookBranchResponse } from '@/types/fiscal-book';

const distributorBranch: FiscalBookBranchResponse = {
  id: 20,
  companyId: 30,
  city: 'Los Teques',
  state: 'Miranda',
  address: 'Calle Distribuidor 1',
  phone: '02121234567',
  email: 'dist@example.com',
  isClient: false,
  isDistributor: true,
  isServiceCenter: false,
  company: {
    id: 30,
    businessName: 'Distribuidora Demo C.A.',
    rif: 'J111111111',
    contributorType: 'ordinario',
  },
};

const manufacturerBranch: FiscalBookBranchResponse = {
  id: 0,
  companyId: 0,
  city: 'LOS TEQUES',
  state: 'MIRANDA',
  address: 'AVENIDA BICENTENARIO',
  phone: '584242913038',
  email: 'soportealphavzla@gmail.com',
  isClient: false,
  isDistributor: false,
  isServiceCenter: false,
  company: {
    id: 0,
    businessName: MANUFACTURER_COMPANY_NAME,
    rif: MANUFACTURER_COMPANY_RIF,
    contributorType: 'ordinario',
  },
};

describe('resolveEnajenadorSucursal', () => {
  it('usa el campo enajenador del backend cuando está presente', () => {
    const sucursal = resolveEnajenadorSucursal(manufacturerBranch, distributorBranch);
    expect(sucursal?.company.razon_social).toBe(MANUFACTURER_COMPANY_NAME);
    expect(sucursal?.company.rif).toBe(MANUFACTURER_COMPANY_RIF);
  });

  it('hace fallback a la sucursal del distribuidor si enajenador es null', () => {
    const sucursal = resolveEnajenadorSucursal(null, distributorBranch);
    expect(sucursal?.company.razon_social).toBe('Distribuidora Demo C.A.');
  });

  it('devuelve null si no hay datos de enajenador', () => {
    expect(resolveEnajenadorSucursal(null, null)).toBeNull();
  });
});
