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

const CELL_WIDTH = 27;

export default function AlignmentDetailView({ row, reference }: AlignmentDetailViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [columnsPerSegment, setColumnsPerSegment] = useState(row.alignedQuery.length || 1);
  const summary = summarizeAlignment(row.alignedQuery, row.alignedRef);
  const structureBlocks = deriveReferenceBlocks(reference);
  const columns = row.alignedQuery.split('').map((queryBase, index) => ({
    queryBase,
    refBase: row.alignedRef[index],
    state: classifyColumn(queryBase, row.alignedRef[index]),
    coordinate: summary.referenceCoordinates[index]
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
      <div className="reference-overview">
        <div className="reference-overview__header">
          <h3>Reference overview</h3>
          <p>{reference.displayName}</p>
        </div>
        <div className="structure-strip" role="list" aria-label="Reference overview blocks">
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
        <div className="structure-legend">
          <span>Prefix</span>
          <span>Conserved</span>
          <span>Cutsite</span>
          <span>PAM</span>
          <span>Postfix</span>
        </div>
      </div>
      <div className="summary-grid">
        <span>Aligned length: {summary.alignedLength}</span>
        <span>Mismatches: {summary.mismatchCount}</span>
        <span>Insertion columns: {summary.insertionCount}</span>
        <span>Deletion columns: {summary.deletionCount}</span>
        <span>Edited regions: {summary.editedRegionCount}</span>
      </div>
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
                  aria-label={`Reference position ${column.coordinate ?? 'gap'}`}
                >
                  {column.coordinate ?? '·'}
                </span>
              ))}
            </div>
            <div className="alignment-track">
              {segment.map((column, index) => (
                <span
                  key={`ref-${segmentIndex}-${index}`}
                  className={`base base--${column.state}`}
                >
                  {column.refBase}
                </span>
              ))}
            </div>
            <div className="alignment-track">
              {segment.map((column, index) => (
                <span
                  key={`query-${segmentIndex}-${index}`}
                  className={`base base--${column.state}`}
                >
                  {column.queryBase}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
