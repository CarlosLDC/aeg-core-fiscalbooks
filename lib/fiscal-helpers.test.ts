import { describe, expect, it } from 'vitest';
import { assignLibroNumbers } from '@/lib/fiscal-helpers';

describe('assignLibroNumbers', () => {
  it('assigns sequential numbers starting at 1', () => {
    const numbered = assignLibroNumbers([
      { id: '10' },
      { id: '3' },
      { id: '7' },
    ]);

    expect(numbered.map((record) => record.libroNumber)).toEqual([1, 2, 3]);
    expect(numbered[0].id).toBe('10');
  });

  it('returns an empty list unchanged', () => {
    expect(assignLibroNumbers([])).toEqual([]);
  });
});
