import { describe, expect, it } from 'vitest';
import {
  canCreateAnnualInspection,
  canCreateTechnicalService,
  canReadFiscalBook,
  isServiceCenterTechnician,
} from '@/lib/fiscal-permissions';
import type { UserProfile } from '@/lib/auth-profile';

function profile(role: UserProfile['role'], extras: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: 1,
    username: 'user@test.local',
    name: 'Test User',
    email: 'user@test.local',
    nationalId: 'V12345678',
    role,
    branchId: null,
    distributorId: null,
    ...extras,
  };
}

describe('fiscal-permissions', () => {
  it('identifies service center technicians', () => {
    expect(isServiceCenterTechnician(profile('TECHNICIAN', { branchId: 5 }))).toBe(true);
    expect(isServiceCenterTechnician(profile('TECHNICIAN'))).toBe(false);
    expect(isServiceCenterTechnician(profile('DISTRIBUTOR', { branchId: 5 }))).toBe(false);
  });

  it('allows technical services for admin and service center technicians only', () => {
    expect(canCreateTechnicalService(profile('ADMIN'))).toBe(true);
    expect(canCreateTechnicalService(profile('TECHNICIAN', { branchId: 3 }))).toBe(true);
    expect(canCreateTechnicalService(profile('TECHNICIAN'))).toBe(false);
    expect(canCreateTechnicalService(profile('DISTRIBUTOR'))).toBe(false);
    expect(canCreateTechnicalService(profile('SENIAT'))).toBe(false);
  });

  it('allows annual inspections for admin, distributor and service center technicians', () => {
    expect(canCreateAnnualInspection(profile('ADMIN'))).toBe(true);
    expect(canCreateAnnualInspection(profile('DISTRIBUTOR'))).toBe(true);
    expect(canCreateAnnualInspection(profile('TECHNICIAN', { branchId: 3 }))).toBe(true);
    expect(canCreateAnnualInspection(profile('TECHNICIAN'))).toBe(false);
    expect(canCreateAnnualInspection(profile('SENIAT'))).toBe(false);
  });

  it('allows fiscal book read for all portal roles', () => {
    expect(canReadFiscalBook('ADMIN')).toBe(true);
    expect(canReadFiscalBook('DISTRIBUTOR')).toBe(true);
    expect(canReadFiscalBook('TECHNICIAN')).toBe(true);
    expect(canReadFiscalBook('SENIAT')).toBe(true);
  });
});
