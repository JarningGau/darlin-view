import { describe, expect, test } from 'vitest';
import { summarizeAlignment } from '../alignment';

function buildSampleAlignment() {
    const referenceLength = 282;
    const deletions = [
        [22, 24],
        [104, 130],
        [238, 238]
    ];
    const delins = [{ start: 158, end: 211, sequence: 'A' }];
    const insertionsAfter = new Map([
        [49, 'AG'],
        [76, 'GG'],
        [265, 'G']
    ]);
    let alignedQuery = '';
    let alignedRef = '';

    for (let position = 1; position <= referenceLength; position += 1) {
        const deletion = deletions.find(([start, end]) => position >= start && position <= end);
        const replacement = delins.find(({ start, end }) => position >= start && position <= end);

        alignedRef += replacement ? 'C' : 'A';
        if (deletion) {
            alignedQuery += '-';
        } else if (replacement) {
            alignedQuery += position === replacement.start ? replacement.sequence : '-';
        } else {
            alignedQuery += 'A';
        }

        const insertion = insertionsAfter.get(position);
        if (insertion) {
            alignedRef += '-'.repeat(insertion.length);
            alignedQuery += insertion;
        }
    }

    return { alignedQuery, alignedRef };
}

function buildNearbyMutationAlignment() {
    const referenceLength = 267;
    const deletions = [
        [23, 127],
        [131, 172],
        [185, 186],
        [199, 215],
        [220, 221],
        [225, 244],
        [266, 267]
    ];
    const substitutions = new Map([
        [181, 'T'],
        [184, 'T'],
        [195, 'C'],
        [198, 'C'],
        [219, 'C'],
        [222, 'C'],
        [224, 'T']
    ]);
    const matchedBases = new Map([
        [128, 'A'],
        [129, 'C'],
        [130, 'G'],
        [182, 'A'],
        [183, 'C'],
        [196, 'A'],
        [197, 'T'],
        [216, 'G'],
        [217, 'G'],
        [218, 'A'],
        [223, 'A']
    ]);
    let alignedQuery = '';
    let alignedRef = '';

    for (let position = 1; position <= referenceLength; position += 1) {
        const deletion = deletions.find(([start, end]) => position >= start && position <= end);
        const substitution = substitutions.get(position);
        const matchedBase = matchedBases.get(position) ?? 'A';

        if (substitution) {
            alignedRef += substitution === 'A' ? 'C' : 'A';
            alignedQuery += substitution;
        } else if (deletion) {
            alignedRef += 'A';
            alignedQuery += '-';
        } else {
            alignedRef += matchedBase;
            alignedQuery += matchedBase;
        }
    }

    return { alignedQuery, alignedRef };
}

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

    test('builds mutation annotation from edited regions', () => {
        const { alignedQuery, alignedRef } = buildSampleAlignment();
        const summary = summarizeAlignment(alignedQuery, alignedRef);

        expect(summary.mutationAnnotation).toBe(
            '22_24del,49_50insAG,76_77insGG,104_130del,158_211delinsA,238_238del,265_266insG'
        );
    });

    test('merges nearby mutations within three reference bases', () => {
        const { alignedQuery, alignedRef } = buildNearbyMutationAlignment();
        const summary = summarizeAlignment(alignedQuery, alignedRef);

        expect(summary.mutationAnnotation).toBe(
            '23_172delinsACG,181_186delinsTACT,195_244delinsCATCGGACCAT,266_267del'
        );
    });

    test('includes insertions after the final reference base in merged delins sequence', () => {
        const summary = summarizeAlignment('AAAAAAAAACT---GAAAAAA', 'AAAAAAAAAATTTT-AAAAAA');

        expect(summary.mutationAnnotation).toBe('10_14delinsCTG');
    });
});
