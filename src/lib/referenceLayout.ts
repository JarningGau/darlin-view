import type { ReferenceDefinition, StructuralBlock } from '../types';

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
    blocks.push({
      type: 'segment',
      label: `Segment ${index + 1}`,
      start: cursor,
      end: cursor + segment.length,
      sequence: segment
    });
    cursor += segment.length;

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
