import { summarizeAlignment } from '../lib/alignment';
import type { AlignmentRow } from '../types';

interface AlignmentListProps {
  rows: AlignmentRow[];
  selectedRowId: string | null;
  onSelect: (rowId: string) => void;
}

export default function AlignmentList({ rows, selectedRowId, onSelect }: AlignmentListProps) {
  if (rows.length === 0) {
    return (
      <section className="panel list-panel">
        <h2>Alignment Rows</h2>
        <p>No rows loaded yet.</p>
      </section>
    );
  }

  return (
    <section className="panel list-panel">
      <h2>Alignment Rows</h2>
      <div role="list" aria-label="Alignment rows" className="alignment-list">
        {rows.map((row) => {
          const summary = summarizeAlignment(row.alignedQuery, row.alignedRef);

          return (
            <button
              key={row.id}
              type="button"
              className={row.id === selectedRowId ? 'alignment-item is-selected' : 'alignment-item'}
              onClick={() => onSelect(row.id)}
              aria-label={`Row ${row.rowNumber}`}
            >
              <strong>Row {row.rowNumber}</strong>
              <span>{row.alignedQuery.slice(0, 18)}</span>
              <small>
                Mismatch {summary.mismatchCount} · InDel {summary.insertionCount + summary.deletionCount}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
