import { describe, expect, it } from 'vitest';
import { userDisplayInitials, userDisplayName } from '@/lib/user-display';

describe('userDisplayName', () => {
  it('prefers the user name over email', () => {
    expect(userDisplayName('Edgar Rivera', 'edgar@example.com')).toBe('Edgar Rivera');
  });

  it('falls back to email', () => {
    expect(userDisplayName(null, 'edgar@example.com')).toBe('edgar@example.com');
  });
});

describe('userDisplayInitials', () => {
  it('uses two initials from a full name', () => {
    expect(userDisplayInitials('Carlos Gómez', 'carlos@example.com')).toBe('CG');
  });

  it('uses email prefix when name is missing', () => {
    expect(userDisplayInitials(null, 'segar12345@gmail.com')).toBe('SE');
  });
});
