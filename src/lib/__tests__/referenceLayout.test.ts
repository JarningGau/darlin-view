import { describe, expect, test } from 'vitest';
import { referencesById } from '../../data/references';
import { deriveReferenceBlocks } from '../referenceLayout';

describe('deriveReferenceBlocks', () => {
  test('creates ordered structural blocks for the CA array', () => {
    const blocks = deriveReferenceBlocks(referencesById.CA);
    const firstConsite = blocks.find((block) => block.type === 'consite');
    const firstCutsite = blocks.find((block) => block.type === 'cutsite');

    expect(blocks[0]).toMatchObject({
      type: 'prefix',
      start: 0,
      sequence: referencesById.CA.prefix
    });
    expect(blocks.at(-1)).toMatchObject({
      type: 'postfix'
    });
    expect(blocks.filter((block) => block.type === 'consite')).toHaveLength(10);
    expect(blocks.filter((block) => block.type === 'cutsite')).toHaveLength(10);
    expect(blocks.filter((block) => block.type === 'pam')).toHaveLength(10);
    expect(firstConsite?.sequence).toHaveLength(13);
    expect(firstCutsite?.sequence).toHaveLength(7);
  });
});
