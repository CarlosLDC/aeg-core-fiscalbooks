export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const INACTIVITY_WARNING_SECONDS = 60;

export const INACTIVITY_ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;

export function formatInactivityCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${safe} s`;
}
