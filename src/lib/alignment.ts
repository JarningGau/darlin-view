import type { AlignmentSummary } from '../types';

function isEdited(queryBase: string, refBase: string) {
  return queryBase !== refBase;
}

export function summarizeAlignment(alignedQuery: string, alignedRef: string): AlignmentSummary {
  let mismatchCount = 0;
  let insertionCount = 0;
  let deletionCount = 0;
  let editedRegionCount = 0;
  let inEditedRegion = false;
  let referenceCursor = 0;
  const referenceCoordinates: Array<number | null> = [];

  for (let index = 0; index < alignedQuery.length; index += 1) {
    const queryBase = alignedQuery[index];
    const refBase = alignedRef[index];

    if (refBase === '-') {
      insertionCount += 1;
      referenceCoordinates.push(null);
    } else {
      referenceCoordinates.push(referenceCursor);
      if (queryBase === '-') {
        deletionCount += 1;
      } else if (queryBase !== refBase) {
        mismatchCount += 1;
      }
      referenceCursor += 1;
    }

    if (isEdited(queryBase, refBase)) {
      if (!inEditedRegion) {
        editedRegionCount += 1;
        inEditedRegion = true;
      }
    } else {
      inEditedRegion = false;
    }
  }

  return {
    alignedLength: alignedQuery.length,
    mismatchCount,
    insertionCount,
    deletionCount,
    editedRegionCount,
    hasGap: insertionCount > 0 || deletionCount > 0,
    hasMismatch: mismatchCount > 0,
    referenceCoordinates
  };
}
