import { useMemo, useState } from 'react';
import AlignmentDetailView from './components/AlignmentDetailView';
import AlignmentList from './components/AlignmentList';
import EmptyState from './components/EmptyState';
import Toolbar from './components/Toolbar';
import { referencesById } from './data/references';
import { parseAlignmentTsv } from './lib/tsv';
import type { AlignmentRow, ArrayId } from './types';

function readFileText(file: File): Promise<string> {
    if (typeof file.text === 'function') {
        return file.text();
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error ?? new Error('Could not read TSV'));
        reader.readAsText(file);
    });
}

export default function App() {
    const [selectedArray, setSelectedArray] = useState<ArrayId>('CA');
    const [queryText, setQueryText] = useState('');
    const [rows, setRows] = useState<AlignmentRow[]>([]);
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const reference = referencesById[selectedArray];
    const visibleRows = useMemo(() => {
        const needle = queryText.trim().toUpperCase();
        if (!needle) {
            return rows;
        }

        return rows.filter(
            (row) => row.alignedQuery.includes(needle) || row.alignedRef.includes(needle)
        );
    }, [queryText, rows]);

    const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? visibleRows[0] ?? null;

    function loadAlignmentText(text: string) {
        try {
            const nextRows = parseAlignmentTsv(text);
            setRows(nextRows);
            setSelectedRowId(nextRows[0]?.id ?? null);
            setErrorMessage(null);
        } catch (error) {
            setRows([]);
            setSelectedRowId(null);
            setErrorMessage(error instanceof Error ? error.message : 'Could not read TSV');
        }
    }

    async function handleFileChange(file: File | null) {
        if (!file) {
            setRows([]);
            setSelectedRowId(null);
            setErrorMessage(null);
            return;
        }

        try {
            const text = await readFileText(file);
            loadAlignmentText(text);
        } catch (error) {
            setRows([]);
            setSelectedRowId(null);
            setErrorMessage(error instanceof Error ? error.message : 'Could not read TSV');
        }
    }

    return (
        <main className="app-shell">
            <Toolbar
                selectedArray={selectedArray}
                onArrayChange={setSelectedArray}
                queryText={queryText}
                onQueryTextChange={setQueryText}
                totalRows={rows.length}
                visibleRows={visibleRows.length}
                onFileChange={handleFileChange}
            />
            {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
            <div className="workspace">
                <AlignmentList rows={visibleRows} selectedRowId={selectedRowId} onSelect={setSelectedRowId} />
                <section className="detail-panel">
                    {selectedRow ? <AlignmentDetailView row={selectedRow} reference={reference} /> : <EmptyState />}
                </section>
            </div>
        </main>
    );
}
