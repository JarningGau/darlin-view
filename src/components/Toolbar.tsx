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
  return (
    <header className="toolbar">
      <div className="brand">
        <h1>darlin-view</h1>
        <p>Interactive DARLIN reference and alignment browser</p>
      </div>
      <label>
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
      <label>
        Search
        <input
          aria-label="Search"
          value={queryText}
          onChange={(event) => onQueryTextChange(event.target.value)}
          placeholder="Filter by aligned sequence"
        />
      </label>
      <label className="upload-field">
        Upload alignment TSV
        <input
          aria-label="Upload TSV"
          type="file"
          accept=".tsv,text/tab-separated-values"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </label>
      <div className="stats">
        <span>Total rows: {totalRows}</span>
        <span>Visible rows: {visibleRows}</span>
      </div>
    </header>
  );
}
