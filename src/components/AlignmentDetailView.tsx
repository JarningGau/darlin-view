import { useEffect, useMemo, useRef, useState } from 'react';
import { summarizeAlignment } from '../lib/alignment';
import { deriveReferenceBlocks } from '../lib/referenceLayout';
import type { AlignmentRow, ReferenceDefinition } from '../types';

type ColumnState = 'insertion' | 'deletion' | 'mismatch' | 'match' | 'complex';

interface AlignmentDetailViewProps {
    row: AlignmentRow;
    reference: ReferenceDefinition;
}

function classifyColumn(queryBase: string, refBase: string): ColumnState {
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

function baseToken(base: string) {
    const upper = base.toUpperCase();
    if (upper === 'A' || upper === 'C' || upper === 'G' || upper === 'T') {
        return upper;
    }
    if (base === '-') {
        return 'GAP';
    }
    return 'N';
}

const CELL_WIDTH = 27;
const TRACK_LABEL_WIDTH = 72;
const TRACK_LABEL_GAP = 10;
const TRACK_RESERVED_WIDTH = TRACK_LABEL_WIDTH + TRACK_LABEL_GAP;
const RULER_SPACE = 1;

export default function AlignmentDetailView({ row, reference }: AlignmentDetailViewProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [columnsPerSegment, setColumnsPerSegment] = useState(row.alignedQuery.length || 1);
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
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

    // Within each contiguous edited region, mark as "complex" when multiple
    // basic mutation types (insertion/deletion/mismatch) occur together.
    for (let index = 0; index < columns.length;) {
        if (columns[index].state === 'match') {
            index += 1;
            continue;
        }

        let regionEnd = index;
        const regionStates = new Set<ColumnState>();

        while (regionEnd < columns.length && columns[regionEnd].state !== 'match') {
            regionStates.add(columns[regionEnd].state);
            regionEnd += 1;
        }

        if (regionStates.size > 1) {
            for (let cursor = index; cursor < regionEnd; cursor += 1) {
                columns[cursor].state = 'complex';
            }
        }

        index = regionEnd;
    }

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
            const tracksWidth = Math.max(0, width - TRACK_RESERVED_WIDTH);
            const nextColumns = Math.max(1, Math.floor(tracksWidth / CELL_WIDTH));
            setColumnsPerSegment(Math.min(row.alignedQuery.length, nextColumns));
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, [row.alignedQuery.length]);

    useEffect(() => {
        if (copyState === 'idle') {
            return;
        }

        const timeout = window.setTimeout(() => setCopyState('idle'), 1200);
        return () => window.clearTimeout(timeout);
    }, [copyState]);

    async function copyToClipboard(text: string) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) {
            throw new Error('Copy failed');
        }
    }

    return (
        <section className="panel detail-panel-inner" aria-label={`Alignment detail for row ${row.rowNumber}`}>
            <div className="detail-header">
                <h2 className="panel-title">Alignment detail</h2>
                <div className="detail-header__right">
                    <span className="muted">Row {row.rowNumber}</span>
                </div>
            </div>

            <section className="mutation-panel" aria-label="Mutation annotation">
                <div className="mutation-panel__header">
                    <h3 className="section-title">Mutation annotation</h3>
                    <div className="mutation-panel__actions" aria-label="Export actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={!summary.mutationAnnotation}
                            aria-label="Copy annotation"
                            onClick={async () => {
                                try {
                                    await copyToClipboard(summary.mutationAnnotation || '');
                                    setCopyState('copied');
                                } catch {
                                    setCopyState('error');
                                }
                            }}
                        >
                            {copyState === 'copied'
                                ? 'Copied'
                                : copyState === 'error'
                                    ? 'Copy failed'
                                    : 'Copy annotation'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled
                            aria-label="Export SVG"
                            title="Export SVG (coming soon)"
                        >
                            Export SVG
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled
                            aria-label="Export PNG"
                            title="Export PNG (coming soon)"
                        >
                            Export PNG
                        </button>
                    </div>
                </div>

                <div className="mutation-annotation-output" aria-label="Mutation annotation output">
                    {summary.mutationAnnotation || <span className="muted">None</span>}
                </div>
            </section>

            <section aria-label="Alignment">
                <h3 className="section-title">Alignment</h3>
                <div ref={containerRef} className="alignment-segments">
                    {alignmentSegments.map((segment, segmentIndex) => {
                        const overview = segment.map((column) => {
                            return column.state === 'match' ? 'match' : column.state;
                        });

                        return (
                            <div
                                key={`segment-${segmentIndex}`}
                                className="alignment-segment"
                                data-testid={`alignment-segment-${segmentIndex}`}
                            >
                                <div className="alignment-overview" aria-label="Overview">
                                    <span className="alignment-overview__label">Overview</span>
                                    <div className="alignment-overview__track" aria-hidden="true">
                                        {overview.map((state, index) => (
                                            <span
                                                key={`ov-${segmentIndex}-${index}`}
                                                className={`overview-cell overview-cell--${state}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="alignment-ruler" aria-label="Coordinate ruler">
                                    <span className="alignment-ruler__label" aria-hidden="true" />
                                    <div className="alignment-ruler__cells">
                                        {segment.map((column, index) => {
                                            const position = column.coordinate !== null ? column.coordinate + 1 : null;
                                            const isMajor = position !== null && position % RULER_SPACE === 0;
                                            return (
                                                <span
                                                    key={`ruler-${segmentIndex}-${index}`}
                                                    className={isMajor ? 'ruler-cell ruler-cell--major' : 'ruler-cell'}
                                                    data-testid={`ruler-cell-${segmentIndex}-${index}`}
                                                    aria-label={`Reference position ${position ?? 'gap'}`}
                                                >
                                                    {isMajor ? position : ''}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="alignment-track-row" aria-label="Reference context">
                                    <span className="alignment-track-row__label">Context</span>
                                    <div className="alignment-track">
                                        {segment.map((column, index) => {
                                            let contextClass = 'context-cell';
                                            if (column.isCutsite) {
                                                contextClass += ' context-cell--cutsite';
                                            } else if (column.isPam) {
                                                contextClass += ' context-cell--pam';
                                            } else if (column.isConsite) {
                                                contextClass += ' context-cell--consite';
                                            }

                                            return (
                                                <span
                                                    key={`ctx-${segmentIndex}-${index}`}
                                                    className={contextClass}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="alignment-track-row" aria-label="Reference sequence">
                                    <span className="alignment-track-row__label">Reference</span>
                                    <div className="alignment-track">
                                        {segment.map((column, index) => (
                                            <span
                                                key={`ref-${segmentIndex}-${index}`}
                                                className={`base base--${column.state}${column.state !== 'match' && column.isCutsite
                                                    ? ' base--mutation-over-cutsite'
                                                    : ''
                                                    }${column.state !== 'match' && column.isPam
                                                        ? ' base--mutation-over-pam'
                                                        : ''
                                                    }`}
                                            >
                                                {column.refBase}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="alignment-track-row" aria-label="Read sequence">
                                    <span className="alignment-track-row__label">Query</span>
                                    <div className="alignment-track">
                                        {segment.map((column, index) => (
                                            <span
                                                key={`query-${segmentIndex}-${index}`}
                                                className={`base base--${column.state}${column.state !== 'match' && column.isCutsite
                                                    ? ' base--mutation-over-cutsite'
                                                    : ''
                                                    }${column.state !== 'match' && column.isPam
                                                        ? ' base--mutation-over-pam'
                                                        : ''
                                                    }`}
                                            >
                                                {column.queryBase}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="reference-overview" aria-label="Reference structure">
                <div className="reference-overview__header">
                    <h3 className="section-title">Reference structure</h3>
                    <p className="muted">{reference.displayName}</p>
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
            </section>
        </section>
    );
}
