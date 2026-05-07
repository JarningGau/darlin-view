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
