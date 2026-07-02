import { describe, expect, it } from 'vitest';
import {
  INACTIVITY_TIMEOUT_MS,
  INACTIVITY_WARNING_SECONDS,
  formatInactivityCountdown,
} from '@/lib/inactivity-session';

describe('inactivity-session', () => {
  it('uses a 15 minute inactivity window', () => {
    expect(INACTIVITY_TIMEOUT_MS).toBe(15 * 60 * 1000);
  });

  it('uses a 60 second warning countdown', () => {
    expect(INACTIVITY_WARNING_SECONDS).toBe(60);
  });

  it('formats countdown seconds', () => {
    expect(formatInactivityCountdown(60)).toBe('60 s');
    expect(formatInactivityCountdown(0)).toBe('0 s');
    expect(formatInactivityCountdown(59.9)).toBe('59 s');
  });
});
