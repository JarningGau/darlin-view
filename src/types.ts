export type ArrayId = 'CA' | 'TA' | 'RA';

export type StructuralBlockType = 'prefix' | 'segment' | 'pam' | 'postfix';

export interface ReferenceDefinition {
  id: ArrayId;
  displayName: string;
  referenceSequence: string;
  prefix: string;
  segments: string[];
  pam: string;
  postfix: string;
}

export interface StructuralBlock {
  type: StructuralBlockType;
  label: string;
  start: number;
  end: number;
  sequence: string;
}

export interface AlignmentRow {
  id: string;
  rowNumber: number;
  alignedQuery: string;
  alignedRef: string;
}

export interface AlignmentSummary {
  alignedLength: number;
  mismatchCount: number;
  insertionCount: number;
  deletionCount: number;
  editedRegionCount: number;
  hasGap: boolean;
  hasMismatch: boolean;
  referenceCoordinates: Array<number | null>;
}
