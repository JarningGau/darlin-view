import { describe, expect, test } from 'vitest';
import { parseAlignmentTsv } from '../tsv';

describe('parseAlignmentTsv', () => {
  test('parses headered input', () => {
    const rows = parseAlignmentTsv('aligned_query\taligned_ref\nAC-G\tACCG\n');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      alignedQuery: 'AC-G',
      alignedRef: 'ACCG'
    });
  });

  test('parses headerless input', () => {
    const rows = parseAlignmentTsv('AC-G\tACCG\n');
    expect(rows[0].rowNumber).toBe(1);
  });

  test('reports unequal column lengths with row number', () => {
    expect(() => parseAlignmentTsv('aligned_query\taligned_ref\nACG\tAC-G\n')).toThrow(
      'Row 1: aligned_query and aligned_ref must have equal length'
    );
  });
});
