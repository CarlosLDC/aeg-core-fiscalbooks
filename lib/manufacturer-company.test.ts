import { describe, expect, it } from 'vitest';
import {
  MANUFACTURER_COMPANY_NAME,
  MANUFACTURER_COMPANY_RIF,
  withManufacturerCompanyFallback,
} from '@/lib/manufacturer-company';

describe('withManufacturerCompanyFallback', () => {
  it('conserva nombre y RIF cuando ambos vienen del backend', () => {
    expect(
      withManufacturerCompanyFallback('Centro Demo', 'J123456789'),
    ).toEqual({ serviceCenter: 'Centro Demo', centerRif: 'J123456789' });
  });

  it('usa la empresa fabricante cuando faltan ambos (admin sin centro)', () => {
    expect(withManufacturerCompanyFallback(null, null)).toEqual({
      serviceCenter: MANUFACTURER_COMPANY_NAME,
      centerRif: MANUFACTURER_COMPANY_RIF,
    });
  });

  it('conserva datos parciales del backend', () => {
    expect(withManufacturerCompanyFallback('Centro Demo', null)).toEqual({
      serviceCenter: 'Centro Demo',
      centerRif: null,
    });
  });
});
