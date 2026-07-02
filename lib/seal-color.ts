const KNOWN_SEAL_COLOR_LABELS: Record<string, string> = {
  azul: 'Azul',
  morado: 'Morado',
  verde: 'Verde',
  verde_neon: 'Verde neón',
};

function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toLocaleUpperCase('es') + word.slice(1).toLocaleLowerCase('es');
}

/** Convierte códigos de color (p. ej. `verde_neon`) a texto legible (`Verde neón`). */
export function formatSealColor(color: string): string {
  const trimmed = color.trim();
  if (!trimmed) return '';

  const known = KNOWN_SEAL_COLOR_LABELS[trimmed.toLowerCase()];
  if (known) return known;

  if (trimmed.includes('_')) {
    const words = trimmed
      .split('_')
      .filter(Boolean)
      .map((part) => part.toLocaleLowerCase('es'));
    if (words.length === 0) return '';
    words[0] = capitalizeWord(words[0]);
    return words.join(' ');
  }

  return capitalizeWord(trimmed);
}

export function sealColorMatchesQuery(color: string, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  const haystack = [color, formatSealColor(color), color.replace(/_/g, ' ')]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}
