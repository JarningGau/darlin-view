import { summarizeAlignment } from '../lib/alignment';
import type { AlignmentRow } from '../types';

interface AlignmentDetailViewProps {
  row: AlignmentRow;
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

export default function AlignmentDetailView({ row }: AlignmentDetailViewProps) {
  const summary = summarizeAlignment(row.alignedQuery, row.alignedRef);
  const columns = row.alignedQuery.split('').map((queryBase, index) => ({
    queryBase,
    refBase: row.alignedRef[index],
    state: classifyColumn(queryBase, row.alignedRef[index]),
    coordinate: summary.referenceCoordinates[index]
  }));

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Alignment Detail</h2>
        <p>Row {row.rowNumber}</p>
      </div>
      <div className="summary-grid">
        <span>Aligned length: {summary.alignedLength}</span>
        <span>Mismatches: {summary.mismatchCount}</span>
        <span>Insertion columns: {summary.insertionCount}</span>
        <span>Deletion columns: {summary.deletionCount}</span>
        <span>Edited regions: {summary.editedRegionCount}</span>
      </div>
      <div className="alignment-ruler">
        {columns.map((column, index) => (
          <span key={`ruler-${index}`}>{column.coordinate ?? '·'}</span>
        ))}
      </div>
      <div className="alignment-track">
        {columns.map((column, index) => (
          <span key={`ref-${index}`} className={`base base--${column.state}`}>
            {column.refBase}
          </span>
        ))}
      </div>
      <div className="alignment-track">
        {columns.map((column, index) => (
          <span key={`query-${index}`} className={`base base--${column.state}`}>
            {column.queryBase}
          </span>
        ))}
      </div>
    </section>
  );
}
