import { useEffect, useMemo, useRef, useState } from 'react';
import { summarizeAlignment } from '../lib/alignment';
import { deriveReferenceBlocks } from '../lib/referenceLayout';
import type { AlignmentRow, ReferenceDefinition } from '../types';

interface AlignmentDetailViewProps {
    row: AlignmentRow;
    reference: ReferenceDefinition;
}

function classifyColumn(queryBase: string, refBase: string) {
    if (refBase === '-') {
        return 'insertion';
    }
    if (queryBase === '-') {
        return 'deletion';
    }
    if (queryBase !== refBase) {
        return 'mismatch';
    }
    return 'match';
}

function isCoordinateInRanges(coordinate: number | null, ranges: Array<{ start: number; end: number }>) {
    return coordinate !== null && ranges.some((range) => coordinate >= range.start && coordinate < range.end);
}

const CELL_WIDTH = 27;

export default function AlignmentDetailView({ row, reference }: AlignmentDetailViewProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [columnsPerSegment, setColumnsPerSegment] = useState(row.alignedQuery.length || 1);
    const summary = summarizeAlignment(row.alignedQuery, row.alignedRef);
    const structureBlocks = deriveReferenceBlocks(reference);
    const cutsiteRanges = structureBlocks
        .filter((block) => block.type === 'cutsite')
        .map(({ start, end }) => ({ start, end }));
    const consiteRanges = structureBlocks
        .filter((block) => block.type === 'consite')
        .map(({ start, end }) => ({ start, end }));
    const pamRanges = structureBlocks
        .filter((block) => block.type === 'pam')
        .map(({ start, end }) => ({ start, end }));
    const columns = row.alignedQuery.split('').map((queryBase, index) => ({
        queryBase,
        refBase: row.alignedRef[index],
        state: classifyColumn(queryBase, row.alignedRef[index]),
        coordinate: summary.referenceCoordinates[index],
        isConsite: isCoordinateInRanges(summary.referenceCoordinates[index], consiteRanges),
        isCutsite: isCoordinateInRanges(summary.referenceCoordinates[index], cutsiteRanges),
        isPam: isCoordinateInRanges(summary.referenceCoordinates[index], pamRanges)
    }));
    const alignmentSegments = useMemo(() => {
        const size = Math.max(1, columnsPerSegment);
        return columns.reduce<typeof columns[]>((segments, _, index) => {
            if (index % size === 0) {
                segments.push(columns.slice(index, index + size));
            }
            return segments;
        }, []);
    }, [columns, columnsPerSegment]);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width ?? node.clientWidth;
            const nextColumns = Math.max(1, Math.floor(width / CELL_WIDTH));
            setColumnsPerSegment(Math.min(row.alignedQuery.length, nextColumns));
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, [row.alignedQuery.length]);

    return (
        <section className="panel">
            <div className="panel-header">
                <h2>Alignment Detail</h2>
                <p>Row {row.rowNumber}</p>
            </div>
            <div className="mutation-annotation">
                <h3 className="alignment-heading">Mutation annotation</h3>
                <code>{summary.mutationAnnotation || 'None'}</code>
            </div>
            <h3 className="alignment-heading">Alignment</h3>
            <div ref={containerRef} className="alignment-segments">
                {alignmentSegments.map((segment, segmentIndex) => (
                    <div
                        key={`segment-${segmentIndex}`}
                        className="alignment-segment"
                        data-testid={`alignment-segment-${segmentIndex}`}
                    >
                        <div className="alignment-ruler">
                            {segment.map((column, index) => (
                                <span
                                    key={`ruler-${segmentIndex}-${index}`}
                                    className="ruler-cell"
                                    data-testid={`ruler-cell-${segmentIndex}-${index}`}
                                    aria-label={`Reference position ${column.coordinate !== null ? column.coordinate + 1 : 'gap'
                                        }`}
                                >
                                    {column.coordinate !== null ? column.coordinate + 1 : '·'}
                                </span>
                            ))}
                        </div>
                        <div className="alignment-track">
                            {segment.map((column, index) => (
                                <span
                                    key={`ref-${segmentIndex}-${index}`}
                                    className={`base base--${column.state}${column.isConsite ? ' base--consite-region' : ''}${column.isCutsite ? ' base--cutsite-region' : ''}${column.isPam ? ' base--pam-region' : ''}`}
                                >
                                    {column.refBase}
                                </span>
                            ))}
                        </div>
                        <div className="alignment-track">
                            {segment.map((column, index) => (
                                <span
                                    key={`query-${segmentIndex}-${index}`}
                                    className={`base base--${column.state}${column.isConsite ? ' base--consite-region' : ''}${column.isCutsite ? ' base--cutsite-region' : ''}${column.isPam ? ' base--pam-region' : ''}`}
                                >
                                    {column.queryBase}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="reference-overview">
                <div className="reference-overview__header">
                    <h3>Reference structure</h3>
                    <p>{reference.displayName}</p>
                </div>
                <div className="structure-strip" role="list" aria-label="Reference structure blocks">
                    {structureBlocks.map((block) => (
                        <div
                            key={`${block.type}-${block.start}`}
                            className={`structure-block structure-block--${block.type}`}
                            title={`${block.label}: ${block.start}-${block.end - 1}`}
                        >
                            <span>{block.label}</span>
                            <small>
                                {block.start}-{block.end - 1}
                            </small>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
