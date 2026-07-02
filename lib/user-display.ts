export function userDisplayName(name: string | null, email: string): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  return email.trim() || '—';
}

export function userDisplayInitials(name: string | null, email: string): string {
  const display = userDisplayName(name, email);
  if (display === '—') return '?';

  if (display.includes('@')) {
    const local = display.split('@')[0] ?? display;
    return local.slice(0, 2).toUpperCase();
  }

  const parts = display.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }

  return display.slice(0, 2).toUpperCase();
}
