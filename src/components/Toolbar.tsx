import { useRef, useState, type FormEvent } from 'react';
import type { ArrayId } from '../types';

interface ToolbarProps {
    selectedArray: ArrayId;
    onArrayChange: (next: ArrayId) => void;
    totalRows: number;
    visibleRows: number;
    onFileChange: (file: File | null) => void;
}

export default function Toolbar({
    selectedArray,
    onArrayChange,
    totalRows,
    visibleRows,
    onFileChange
}: ToolbarProps) {
    const [tsvText, setTsvText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const statsText = `n = ${totalRows} alignments \u00b7 filtered = ${visibleRows}`;

    function handleTextSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onFileChange(new File([tsvText], 'pasted-alignment.tsv', { type: 'text/tab-separated-values' }));
    }

    function handleFileUpload() {
        if (!selectedFile) {
            return;
        }

        onFileChange(selectedFile);
    }

    function handleFileClear() {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileChange(null);
    }

    return (
        <header className="toolbar">
            <div className="toolbar__brand">
                <div className="brand">
                    <h1>darlin-view</h1>
                    <p>Interactive DARLIN reference and alignment browser</p>
                </div>
                <p className="stats" aria-label="Dataset summary">
                    {statsText}
                </p>
            </div>

            <div className="toolbar__controls" aria-label="Controls">
                <div className="toolbar__controls-left">
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

                    <div className="toolbar__import" aria-label="Import alignment">
                        <div className="import-file">
                            <label className="field upload-field import-file__field">
                                Import alignment
                                <input
                                    ref={fileInputRef}
                                    aria-label="Upload TSV"
                                    type="file"
                                    accept=".tsv,text/tab-separated-values"
                                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                                />
                            </label>
                            <div className="import-actions" aria-label="Import file actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleFileUpload}
                                    disabled={!selectedFile}
                                    aria-label="Upload alignment file"
                                >
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleFileClear}
                                    disabled={!selectedFile && totalRows === 0}
                                    aria-label="Clear alignments"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form className="import-paste" onSubmit={handleTextSubmit} aria-label="Paste TSV">
                <label className="field" htmlFor="alignment-tsv-text">
                    Paste TSV
                    <textarea
                        id="alignment-tsv-text"
                        aria-label="Paste TSV"
                        value={tsvText}
                        onChange={(event) => setTsvText(event.target.value)}
                        placeholder={'aligned_query\taligned_ref\nAC-G\tACCG'}
                        rows={3}
                    />
                </label>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={tsvText.trim().length === 0}
                    aria-label="Submit pasted TSV"
                >
                    Submit TSV
                </button>
            </form>
        </header>
    );
}
