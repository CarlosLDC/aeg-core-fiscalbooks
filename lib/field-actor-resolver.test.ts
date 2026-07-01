import { describe, expect, it, vi } from 'vitest';
import {
  MANUFACTURER_COMPANY_NAME,
  MANUFACTURER_COMPANY_RIF,
} from '@/lib/manufacturer-company';
import {
  resolveAnnualInspectionActor,
  resolveTechnicalServiceActor,
} from '@/lib/field-actor-resolver';
import type { UserProfile } from '@/lib/auth-profile';

vi.mock('@/lib/service-centers-api', () => ({
  fetchServiceCenters: vi.fn().mockResolvedValue([]),
}));

const adminProfile: UserProfile = {
  userId: 1,
  username: 'admin@aeg.com',
  name: 'Admin AEG',
  email: 'admin@aeg.com',
  nationalId: 'V12345678',
  role: 'ADMIN',
  branchId: null,
  distributorId: null,
};

describe('resolveTechnicalServiceActor', () => {
  it('asigna la empresa fabricante al administrador', async () => {
    const result = await resolveTechnicalServiceActor(adminProfile);
    expect(result).toMatchObject({
      userId: 1,
      companyName: MANUFACTURER_COMPANY_NAME,
      companyRif: MANUFACTURER_COMPANY_RIF,
      serviceCenterId: null,
    });
  });
});

describe('resolveAnnualInspectionActor', () => {
  it('asigna la empresa fabricante al administrador', async () => {
    const result = await resolveAnnualInspectionActor(adminProfile);
    expect(result).toMatchObject({
      userId: 1,
      companyName: MANUFACTURER_COMPANY_NAME,
      companyRif: MANUFACTURER_COMPANY_RIF,
      serviceCenterId: null,
    });
  });
});
