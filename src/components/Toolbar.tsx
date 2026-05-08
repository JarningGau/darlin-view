import { useState, type FormEvent } from 'react';
import type { ArrayId } from '../types';

interface ToolbarProps {
    selectedArray: ArrayId;
    onArrayChange: (next: ArrayId) => void;
    queryText: string;
    onQueryTextChange: (value: string) => void;
    totalRows: number;
    visibleRows: number;
    onFileChange: (file: File | null) => void;
}

export default function Toolbar({
    selectedArray,
    onArrayChange,
    queryText,
    onQueryTextChange,
    totalRows,
    visibleRows,
    onFileChange
}: ToolbarProps) {
    const [tsvText, setTsvText] = useState('');

    function handleTextSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onFileChange(new File([tsvText], 'pasted-alignment.tsv', { type: 'text/tab-separated-values' }));
    }

    return (
        <header className="toolbar">
            <div className="toolbar__summary">
                <div className="brand">
                    <h1>darlin-view</h1>
                    <p>Interactive DARLIN reference and alignment browser</p>
                </div>
                <div className="stats">
                    <span>Total rows: {totalRows}</span>
                    <span>Visible rows: {visibleRows}</span>
                </div>
            </div>
            <div className="toolbar__actions">
                <div className="toolbar__filters">
                    <label className="field">
                        Array
                        <select
                            aria-label="Array"
                            value={selectedArray}
                            onChange={(event) => onArrayChange(event.target.value as ArrayId)}
                        >
                            <option value="CA">CA</option>
                            <option value="TA">TA</option>
                            <option value="RA">RA</option>
                        </select>
                    </label>
                    <label className="field">
                        Search
                        <input
                            aria-label="Search"
                            value={queryText}
                            onChange={(event) => onQueryTextChange(event.target.value)}
                            placeholder="Filter by aligned sequence"
                        />
                    </label>
                    <label className="field upload-field">
                        Upload alignment TSV
                        <input
                            aria-label="Upload TSV"
                            type="file"
                            accept=".tsv,text/tab-separated-values"
                            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                        />
                    </label>
                </div>
                <form className="paste-form" onSubmit={handleTextSubmit}>
                    <label htmlFor="alignment-tsv-text">Paste alignment TSV</label>
                    <textarea
                        id="alignment-tsv-text"
                        aria-label="Paste TSV"
                        value={tsvText}
                        onChange={(event) => setTsvText(event.target.value)}
                        placeholder={'aligned_query\taligned_ref\nAC-G\tACCG'}
                        rows={3}
                    />
                    <button type="submit" disabled={tsvText.trim().length === 0}>
                        Submit TSV
                    </button>
                </form>
            </div>
        </header>
    );
}
