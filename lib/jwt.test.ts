import { describe, expect, it } from 'vitest';
import { getRoleFromToken } from '@/lib/jwt';

function tokenWithRole(role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role })).toString('base64url');
  return `${header}.${payload}.sig`;
}

describe('jwt role normalization', () => {
  it('keeps DISTRIBUTOR as its own role', () => {
    expect(getRoleFromToken(tokenWithRole('DISTRIBUTOR'))).toBe('DISTRIBUTOR');
    expect(getRoleFromToken(tokenWithRole('DISTRIBUIDORA'))).toBe('DISTRIBUTOR');
  });

  it('maps legacy SERVICE_CENTER to TECHNICIAN', () => {
    expect(getRoleFromToken(tokenWithRole('SERVICE_CENTER'))).toBe('TECHNICIAN');
  });
});
