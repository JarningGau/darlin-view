import type { ReferenceDefinition, StructuralBlock } from '../types';

const CUTSITE_LENGTH = 7;

export function deriveReferenceBlocks(reference: ReferenceDefinition): StructuralBlock[] {
  const blocks: StructuralBlock[] = [];
  let cursor = 0;

  blocks.push({
    type: 'prefix',
    label: 'Prefix',
    start: cursor,
    end: cursor + reference.prefix.length,
    sequence: reference.prefix
  });
  cursor += reference.prefix.length;

  reference.segments.forEach((segment, index) => {
    const consiteSequence = segment.slice(0, Math.max(0, segment.length - CUTSITE_LENGTH));
    const cutsiteSequence = segment.slice(-CUTSITE_LENGTH);

    blocks.push({
      type: 'consite',
      label: `Conserved ${index + 1}`,
      start: cursor,
      end: cursor + consiteSequence.length,
      sequence: consiteSequence
    });
    cursor += consiteSequence.length;

    blocks.push({
      type: 'cutsite',
      label: `Cutsite ${index + 1}`,
      start: cursor,
      end: cursor + cutsiteSequence.length,
      sequence: cutsiteSequence
    });
    cursor += cutsiteSequence.length;

    blocks.push({
      type: 'pam',
      label: `PAM ${index + 1}`,
      start: cursor,
      end: cursor + reference.pam.length,
      sequence: reference.pam
    });
    cursor += reference.pam.length;
  });

  blocks.push({
    type: 'postfix',
    label: 'Postfix',
    start: cursor,
    end: cursor + reference.postfix.length,
    sequence: reference.postfix
  });

  return blocks;
}
