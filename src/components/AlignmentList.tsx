import { summarizeAlignment } from '../lib/alignment';
import type { AlignmentRow } from '../types';
import type { KeyboardEvent } from 'react';

interface AlignmentListProps {
    rows: AlignmentRow[];
    selectedRowId: string | null;
    onSelect: (rowId: string) => void;
}

export default function AlignmentList({ rows, selectedRowId, onSelect }: AlignmentListProps) {
    function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, rowId: string) {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        onSelect(rowId);
    }

    if (rows.length === 0) {
        return (
            <section className="panel list-panel">
                <h2>Alignments</h2>
                <p>No rows loaded yet.</p>
            </section>
        );
    }

    return (
        <section className="panel list-panel">
            <div className="sidebar-header">
                <h2>Alignments</h2>
                <p className="muted">Select a row</p>
            </div>

            <div className="alignment-table-wrap">
                <table className="alignment-table" aria-label="Alignment rows">
                    <thead>
                        <tr>
                            <th scope="col">Row</th>
                            <th scope="col">Sequence prefix</th>
                            <th scope="col" className="num">
                                Mismatch
                            </th>
                            <th scope="col" className="num">
                                Indel
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const summary = summarizeAlignment(row.alignedQuery, row.alignedRef);
                            const isSelected = row.id === selectedRowId;
                            const indel = summary.insertionCount + summary.deletionCount;

                            return (
                                <tr
                                    key={row.id}
                                    className={isSelected ? 'selected' : undefined}
                                    aria-selected={isSelected}
                                    tabIndex={0}
                                    onClick={() => onSelect(row.id)}
                                    onKeyDown={(event) => handleRowKeyDown(event, row.id)}
                                >
                                    <th scope="row">
                                        <button
                                            type="button"
                                            className="row-select"
                                            onClick={() => onSelect(row.id)}
                                            aria-label={`Row ${row.rowNumber}`}
                                        >
                                            {row.rowNumber}
                                        </button>
                                    </th>
                                    <td className="mono">{row.alignedQuery.slice(0, 18)}</td>
                                    <td className="num">{summary.mismatchCount}</td>
                                    <td className="num">{indel}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
