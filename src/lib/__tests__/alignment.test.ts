import { describe, expect, test } from 'vitest';
import { summarizeAlignment } from '../alignment';

describe('summarizeAlignment', () => {
  test('counts mismatches, insertions, deletions, and edited regions', () => {
    const summary = summarizeAlignment('AC-TA', 'ATG-A');

    expect(summary).toMatchObject({
      alignedLength: 5,
      mismatchCount: 1,
      insertionCount: 1,
      deletionCount: 1,
      editedRegionCount: 1
    });
    expect(summary.referenceCoordinates).toEqual([0, 1, 2, null, 3]);
  });
});
