import type { AlignmentSummary } from '../types';

const MUTATION_MERGE_DISTANCE = 3;

interface MutationEvent {
    startIndex: number;
    endIndex: number;
    startPosition: number;
    endPosition: number;
    querySequence: string;
    consumesReference: boolean;
}

function isEdited(queryBase: string, refBase: string) {
    return queryBase !== refBase;
}

function previousReferencePosition(referenceCoordinates: Array<number | null>, beforeIndex: number) {
    for (let index = beforeIndex - 1; index >= 0; index -= 1) {
        const coordinate = referenceCoordinates[index];
        if (coordinate !== null) {
            return coordinate + 1;
        }
    }

    return 0;
}

function nextReferencePosition(
    referenceCoordinates: Array<number | null>,
    fromIndex: number,
    fallbackPosition: number
) {
    for (let index = fromIndex; index < referenceCoordinates.length; index += 1) {
        const coordinate = referenceCoordinates[index];
        if (coordinate !== null) {
            return coordinate + 1;
        }
    }

    return fallbackPosition + 1;
}

function formatMutationEvent(event: MutationEvent) {
    if (event.startPosition !== event.endPosition && event.querySequence.length === 0) {
        return `${event.startPosition}_${event.endPosition}del`;
    }

    if (event.querySequence.length === 0) {
        return `${event.startPosition}_${event.endPosition}del`;
    }

    const operation = event.consumesReference ? `delins${event.querySequence}` : `ins${event.querySequence}`;
    return `${event.startPosition}_${event.endPosition}${operation}`;
}

function querySequenceForAlignmentSpan(
    alignedQuery: string,
    startIndex: number,
    endIndex: number
) {
    let querySequence = '';

    for (let index = startIndex; index < endIndex; index += 1) {
        if (alignedQuery[index] !== '-') {
            querySequence += alignedQuery[index];
        }
    }

    return querySequence;
}

function mergeNearbyMutationEvents(events: MutationEvent[], alignedQuery: string) {
    const annotations: string[] = [];

    for (let index = 0; index < events.length; index += 1) {
        const group = [events[index]];

        while (
            index + 1 < events.length &&
            events[index + 1].startPosition - group[group.length - 1].endPosition - 1 <= MUTATION_MERGE_DISTANCE
        ) {
            index += 1;
            group.push(events[index]);
        }

        if (group.length === 1) {
            annotations.push(formatMutationEvent(group[0]));
            continue;
        }

        const startPosition = group[0].startPosition;
        const endPosition = group[group.length - 1].endPosition;
        const querySequence = querySequenceForAlignmentSpan(
            alignedQuery,
            group[0].startIndex,
            group[group.length - 1].endIndex
        );
        const operation = querySequence.length === 0 ? 'del' : `delins${querySequence}`;
        annotations.push(`${startPosition}_${endPosition}${operation}`);
    }

    return annotations;
}

export function buildMutationAnnotations(
    alignedQuery: string,
    alignedRef: string,
    referenceCoordinates: Array<number | null>
) {
    const events: MutationEvent[] = [];

    for (let index = 0; index < alignedQuery.length; index += 1) {
        if (!isEdited(alignedQuery[index], alignedRef[index])) {
            continue;
        }

        const regionStart = index;
        const refPositions: number[] = [];
        let querySequence = '';

        while (index < alignedQuery.length && isEdited(alignedQuery[index], alignedRef[index])) {
            const coordinate = referenceCoordinates[index];

            if (coordinate !== null) {
                refPositions.push(coordinate + 1);
            }
            if (alignedQuery[index] !== '-') {
                querySequence += alignedQuery[index];
            }

            index += 1;
        }

        if (refPositions.length === 0) {
            const leftPosition = previousReferencePosition(referenceCoordinates, regionStart);
            const rightPosition = nextReferencePosition(referenceCoordinates, index, leftPosition);
            events.push({
                startIndex: regionStart,
                endIndex: index,
                startPosition: leftPosition,
                endPosition: rightPosition,
                querySequence,
                consumesReference: false
            });
        } else {
            const startPosition = refPositions[0];
            const endPosition = refPositions[refPositions.length - 1];
            events.push({
                startIndex: regionStart,
                endIndex: index,
                startPosition,
                endPosition,
                querySequence,
                consumesReference: true
            });
        }

        index -= 1;
    }

    return mergeNearbyMutationEvents(events, alignedQuery);
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

    const mutationAnnotations = buildMutationAnnotations(alignedQuery, alignedRef, referenceCoordinates);

    return {
        alignedLength: alignedQuery.length,
        mismatchCount,
        insertionCount,
        deletionCount,
        editedRegionCount,
        hasGap: insertionCount > 0 || deletionCount > 0,
        hasMismatch: mismatchCount > 0,
        mutationAnnotations,
        mutationAnnotation: mutationAnnotations.join(','),
        referenceCoordinates
    };
}
