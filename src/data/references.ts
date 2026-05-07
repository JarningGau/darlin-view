import type { ArrayId, ReferenceDefinition } from '../types';

function buildReference(prefix: string, segments: string[], pam: string, postfix: string) {
  return `${prefix}${segments.map((segment) => `${segment}${pam}`).join('')}${postfix}`;
}

const COMMON_PREFIX = 'CGCCG';
const COMMON_PAM = 'TGGAGTC';

const CA_SEGMENTS = [
  'GACTGCACGACAGTCGACGA',
  'GACACGACTCGCGCATACGA',
  'GACTACAGTCGCTACGACGA',
  'GCGAGCGCTATGAGCGACTA',
  'GATACGATACGCGCACGCTA',
  'GAGAGCGCGCTCGTCGACTA',
  'GCGACTGTACGCACACGCGA',
  'GATAGTATGCGTACACGCGA',
  'GAGTCGAGACGCTGACGATA',
  'GATACGTAGCACGCAGACGA'
];

const TA_SEGMENTS = [
  'GAGTCGAGACGCTGACGATA',
  'GACACGACTCGCGCATACGA',
  'GCGAGCGCTATGAGCGACTA',
  'GATAGTATGCGTACACGCGA',
  'GACTACAGTCGCTACGACGA',
  'GATACGATACGCGCACGCTA',
  'GCGACTGTACGCACACGCGA',
  'GACTGCACGACAGTCGACGA',
  'GATACGTAGCACGCAGACGA',
  'GAGAGCGCGCTCGTCGACTA'
];

const RA_SEGMENTS = [
  'GCGAGCGCTATGAGCGACTA',
  'GACACGACTCGCGCATACGA',
  'GACTACAGTCGCTACGACGA',
  'GATACGATACGCGCACGCTA',
  'GACTGCACGACAGTCGACGA',
  'GATACGTAGCACGCAGACGA',
  'GAGTCGAGACGCTGACGATA',
  'GATAGTATGCGTACACGCGA',
  'GCGACTGTACGCACACGCGA',
  'GAGAGCGCGCTCGTCGACTA'
];

export const referencesById: Record<ArrayId, ReferenceDefinition> = {
  CA: {
    id: 'CA',
    displayName: 'Col1a1 / CA',
    prefix: COMMON_PREFIX,
    segments: CA_SEGMENTS,
    pam: COMMON_PAM,
    postfix: 'TGGGAGCT',
    referenceSequence: buildReference(COMMON_PREFIX, CA_SEGMENTS, COMMON_PAM, 'TGGGAGCT')
  },
  TA: {
    id: 'TA',
    displayName: 'Tigre / TA',
    prefix: COMMON_PREFIX,
    segments: TA_SEGMENTS,
    pam: COMMON_PAM,
    postfix: COMMON_PAM,
    referenceSequence: buildReference(COMMON_PREFIX, TA_SEGMENTS, COMMON_PAM, COMMON_PAM)
  },
  RA: {
    id: 'RA',
    displayName: 'Rosa / RA',
    prefix: COMMON_PREFIX,
    segments: RA_SEGMENTS,
    pam: COMMON_PAM,
    postfix: COMMON_PAM,
    referenceSequence: buildReference(COMMON_PREFIX, RA_SEGMENTS, COMMON_PAM, COMMON_PAM)
  }
};
