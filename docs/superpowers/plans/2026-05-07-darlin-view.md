# darlin-viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only local web app that visualizes built-in DARLIN reference definitions and browses uploaded `aligned_query` / `aligned_ref` TSV alignment rows.

**Architecture:** Use a Vite-based React + TypeScript single-page app. Keep the biological reference definitions, TSV parsing/validation, and alignment-derived view state in separate modules so the list view, structure view, and detail view remain independently testable.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, CSS variables, `papaparse`

---

## File Structure

### Create

- `package.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles.css`
- `src/types.ts`
- `src/data/references.ts`
- `src/lib/referenceLayout.ts`
- `src/lib/alignment.ts`
- `src/lib/tsv.ts`
- `src/components/Toolbar.tsx`
- `src/components/AlignmentList.tsx`
- `src/components/ReferenceStructureView.tsx`
- `src/components/AlignmentDetailView.tsx`
- `src/components/EmptyState.tsx`
- `src/components/__tests__/App.test.tsx`
- `src/lib/__tests__/referenceLayout.test.ts`
- `src/lib/__tests__/alignment.test.ts`
- `src/lib/__tests__/tsv.test.ts`
- `src/test/setup.ts`

### Responsibilities

- `src/types.ts`: shared domain types for references, structural blocks, uploaded rows, derived summaries, and filters
- `src/data/references.ts`: built-in `CA`, `TA`, `RA` definitions
- `src/lib/referenceLayout.ts`: derive structural spans from reference definitions
- `src/lib/alignment.ts`: summarize alignments and map gapped columns to ungapped reference coordinates
- `src/lib/tsv.ts`: parse and validate uploaded TSV input
- `src/components/*`: UI split by top toolbar, left list, reference structure view, alignment detail view, and empty state
- `src/App.tsx`: top-level state coordination between array choice, uploaded rows, filters, and selected row

## Task 1: Scaffold the Frontend Workspace

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write the failing app smoke test**

Create `src/components/__tests__/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from '../../App';

test('renders the darlin-viewer shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'darlin-viewer' })).toBeInTheDocument();
  expect(screen.getByLabelText('Array')).toHaveValue('CA');
  expect(screen.getByText('Upload alignment TSV')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: FAIL because the Vite/Vitest workspace and `App` module do not exist yet.

- [ ] **Step 3: Write the minimal project scaffold**

Create `package.json`:

```json
{
  "name": "darlin-viewer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "dependencies": {
    "papaparse": "^5.5.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/papaparse": "^5.3.16",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^5.1.0",
    "jsdom": "^27.0.1",
    "typescript": "^5.9.3",
    "vite": "^7.1.11",
    "vitest": "^3.2.4"
  }
}
```

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

Create `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
```

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>darlin-viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/styles.css`:

```css
:root {
  color-scheme: light;
  --bg: #f6f2e8;
  --panel: rgba(255, 252, 247, 0.92);
  --ink: #1f2a24;
  --muted: #5f6b62;
  --line: #d7d0c2;
  --accent: #145c53;
  --shadow: 0 20px 50px rgba(67, 52, 30, 0.12);
  font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(255, 220, 164, 0.35), transparent 28%),
    linear-gradient(180deg, #f9f3e7 0%, #f1ece0 100%);
  color: var(--ink);
}

button,
input,
select {
  font: inherit;
}
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add the minimal `App` shell**

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main>
      <h1>darlin-viewer</h1>
      <label>
        Array
        <select aria-label="Array" defaultValue="CA">
          <option value="CA">CA</option>
          <option value="TA">TA</option>
          <option value="RA">RA</option>
        </select>
      </label>
      <button type="button">Upload alignment TSV</button>
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: PASS with 1 passing test.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src
git commit -m "build: scaffold darlin-viewer frontend"
```

## Task 2: Add Reference Domain Types and Built-In Array Definitions

**Files:**
- Create: `src/types.ts`
- Create: `src/data/references.ts`
- Create: `src/lib/referenceLayout.ts`
- Test: `src/lib/__tests__/referenceLayout.test.ts`

- [ ] **Step 1: Write the failing reference layout test**

Create `src/lib/__tests__/referenceLayout.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { referencesById } from '../../data/references';
import { deriveReferenceBlocks } from '../referenceLayout';

describe('deriveReferenceBlocks', () => {
  test('creates ordered structural blocks for the CA array', () => {
    const blocks = deriveReferenceBlocks(referencesById.CA);

    expect(blocks[0]).toMatchObject({
      type: 'prefix',
      start: 0,
      sequence: referencesById.CA.prefix
    });
    expect(blocks.at(-1)).toMatchObject({
      type: 'postfix'
    });
    expect(blocks.filter((block) => block.type === 'segment')).toHaveLength(10);
    expect(blocks.filter((block) => block.type === 'pam')).toHaveLength(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/lib/__tests__/referenceLayout.test.ts`

Expected: FAIL because `referencesById` and `deriveReferenceBlocks` do not exist.

- [ ] **Step 3: Write the minimal reference model**

Create `src/types.ts`:

```ts
export type ArrayId = 'CA' | 'TA' | 'RA';

export type StructuralBlockType = 'prefix' | 'segment' | 'pam' | 'postfix';

export interface ReferenceDefinition {
  id: ArrayId;
  displayName: string;
  referenceSequence: string;
  prefix: string;
  segments: string[];
  pam: string;
  postfix: string;
}

export interface StructuralBlock {
  type: StructuralBlockType;
  label: string;
  start: number;
  end: number;
  sequence: string;
}
```

Create `src/data/references.ts`:

```ts
import type { ArrayId, ReferenceDefinition } from '../types';

function buildReference(prefix: string, segments: string[], pam: string, postfix: string) {
  return `${prefix}${segments.map((segment) => `${segment}${pam}`).join('')}${postfix}`;
}

const CA_SEGMENTS = [
  'GACTGCACGACAGTCGACGA',
  'GACACGACTCGCGCATACGA',
  'GACTACAGTCGCTACGACGA',
  'GCGAGCGCTATGAGCGACTA',
  'GATACGATACGCGCACGCTA',
  'GAGAGCGCGCTCGTCGACTA',
  'GCGACTGTACGCACACGCGA',
  'GATAGTATGCGTACACGCGA',
  'GAGTCGAGACGCTGACGATA',
  'GATACGTAGCACGCAGACGA'
] as const;

const TA_SEGMENTS = [
  'GAGTCGAGACGCTGACGATA',
  'GACACGACTCGCGCATACGA',
  'GCGAGCGCTATGAGCGACTA',
  'GATAGTATGCGTACACGCGA',
  'GACTACAGTCGCTACGACGA',
  'GATACGATACGCGCACGCTA',
  'GCGACTGTACGCACACGCGA',
  'GACTGCACGACAGTCGACGA',
  'GATACGTAGCACGCAGACGA',
  'GAGAGCGCGCTCGTCGACTA'
] as const;

const RA_SEGMENTS = [
  'GCGAGCGCTATGAGCGACTA',
  'GACACGACTCGCGCATACGA',
  'GACTACAGTCGCTACGACGA',
  'GATACGATACGCGCACGCTA',
  'GACTGCACGACAGTCGACGA',
  'GATACGTAGCACGCAGACGA',
  'GAGTCGAGACGCTGACGATA',
  'GATAGTATGCGTACACGCGA',
  'GCGACTGTACGCACACGCGA',
  'GAGAGCGCGCTCGTCGACTA'
] as const;

export const referencesById: Record<ArrayId, ReferenceDefinition> = {
  CA: {
    id: 'CA',
    displayName: 'Col1a1 / CA',
    prefix: 'CGCCG',
    segments: [...CA_SEGMENTS],
    pam: 'TGGAGTC',
    postfix: 'TGGGAGCT',
    referenceSequence: buildReference('CGCCG', [...CA_SEGMENTS], 'TGGAGTC', 'TGGGAGCT')
  },
  TA: {
    id: 'TA',
    displayName: 'Tigre / TA',
    prefix: 'CGCCG',
    segments: [...TA_SEGMENTS],
    pam: 'TGGAGTC',
    postfix: 'TGGAGTC',
    referenceSequence: buildReference(
      'CGCCG',
      [...TA_SEGMENTS],
      'TGGAGTC',
      'TGGAGTC'
    )
  },
  RA: {
    id: 'RA',
    displayName: 'Rosa / RA',
    prefix: 'CGCCG',
    segments: [...RA_SEGMENTS],
    pam: 'TGGAGTC',
    postfix: 'TGGAGTC',
    referenceSequence: buildReference(
      'CGCCG',
      [...RA_SEGMENTS],
      'TGGAGTC',
      'TGGAGTC'
    )
  }
};
```

Create `src/lib/referenceLayout.ts`:

```ts
import type { ReferenceDefinition, StructuralBlock } from '../types';

export function deriveReferenceBlocks(reference: ReferenceDefinition): StructuralBlock[] {
  let cursor = 0;
  const blocks: StructuralBlock[] = [];

  blocks.push({
    type: 'prefix',
    label: 'Prefix',
    start: cursor,
    end: cursor + reference.prefix.length,
    sequence: reference.prefix
  });
  cursor += reference.prefix.length;

  reference.segments.forEach((segment, index) => {
    blocks.push({
      type: 'segment',
      label: `Segment ${index + 1}`,
      start: cursor,
      end: cursor + segment.length,
      sequence: segment
    });
    cursor += segment.length;

    blocks.push({
      type: 'pam',
      label: `PAM ${index + 1}`,
      start: cursor,
      end: cursor + reference.pam.length,
      sequence: reference.pam
    });
    cursor += reference.pam.length;
  });

  blocks.push({
    type: 'postfix',
    label: 'Postfix',
    start: cursor,
    end: cursor + reference.postfix.length,
    sequence: reference.postfix
  });

  return blocks;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/lib/__tests__/referenceLayout.test.ts`

Expected: PASS with the CA block ordering test green.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/data/references.ts src/lib/referenceLayout.ts src/lib/__tests__/referenceLayout.test.ts
git commit -m "feat: add built-in darlin reference definitions"
```

## Task 3: Implement TSV Parsing, Validation, and Alignment Summaries

**Files:**
- Create: `src/lib/tsv.ts`
- Create: `src/lib/alignment.ts`
- Test: `src/lib/__tests__/tsv.test.ts`
- Test: `src/lib/__tests__/alignment.test.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Write the failing TSV parser tests**

Create `src/lib/__tests__/tsv.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { parseAlignmentTsv } from '../tsv';

describe('parseAlignmentTsv', () => {
  test('parses headered input', () => {
    const rows = parseAlignmentTsv('aligned_query\taligned_ref\nAC-G\tACCG\n');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      alignedQuery: 'AC-G',
      alignedRef: 'ACCG'
    });
  });

  test('parses headerless input', () => {
    const rows = parseAlignmentTsv('AC-G\tACCG\n');
    expect(rows[0].rowNumber).toBe(1);
  });

  test('reports unequal column lengths with row number', () => {
    expect(() => parseAlignmentTsv('aligned_query\taligned_ref\nACG\tAC-G\n')).toThrow(
      'Row 1: aligned_query and aligned_ref must have equal length'
    );
  });
});
```

Create `src/lib/__tests__/alignment.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { summarizeAlignment } from '../alignment';

describe('summarizeAlignment', () => {
  test('counts mismatches, insertions, deletions, and edited regions', () => {
    const summary = summarizeAlignment('AC-TA', 'ATG-A');

    expect(summary).toMatchObject({
      alignedLength: 5,
      mismatchCount: 1,
      insertionCount: 1,
      deletionCount: 1,
      editedRegionCount: 2
    });
    expect(summary.referenceCoordinates).toEqual([0, 1, null, 2, 3]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/lib/__tests__/tsv.test.ts src/lib/__tests__/alignment.test.ts`

Expected: FAIL because parser and alignment summary modules do not exist.

- [ ] **Step 3: Extend shared types**

Update `src/types.ts`:

```ts
export interface AlignmentRow {
  id: string;
  rowNumber: number;
  alignedQuery: string;
  alignedRef: string;
}

export interface AlignmentSummary {
  alignedLength: number;
  mismatchCount: number;
  insertionCount: number;
  deletionCount: number;
  editedRegionCount: number;
  hasGap: boolean;
  hasMismatch: boolean;
  referenceCoordinates: Array<number | null>;
}
```

- [ ] **Step 4: Write the minimal parser and summary helpers**

Create `src/lib/tsv.ts`:

```ts
import Papa from 'papaparse';
import type { AlignmentRow } from '../types';

const VALID_SEQUENCE = /^[ACGTN-]+$/;

export function parseAlignmentTsv(text: string): AlignmentRow[] {
  const parsed = Papa.parse<string[]>(text.trim(), {
    delimiter: '\t',
    skipEmptyLines: true
  });

  const rows = parsed.data;
  if (rows.length === 0) {
    throw new Error('Upload is empty');
  }

  const header = rows[0];
  const hasHeader = header[0] === 'aligned_query' && header[1] === 'aligned_ref';
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows.map((row, index) => {
    const alignedQuery = hasHeader ? row[0] : row[0];
    const alignedRef = hasHeader ? row[1] : row[1];
    const rowNumber = index + 1;

    if (!alignedQuery || !alignedRef) {
      throw new Error(`Row ${rowNumber}: both aligned_query and aligned_ref are required`);
    }
    if (alignedQuery.length !== alignedRef.length) {
      throw new Error(`Row ${rowNumber}: aligned_query and aligned_ref must have equal length`);
    }
    if (!VALID_SEQUENCE.test(alignedQuery) || !VALID_SEQUENCE.test(alignedRef)) {
      throw new Error(`Row ${rowNumber}: sequences may only contain A, C, G, T, N, and -`);
    }

    return {
      id: `row-${rowNumber}`,
      rowNumber,
      alignedQuery,
      alignedRef
    };
  });
}
```

Create `src/lib/alignment.ts`:

```ts
import type { AlignmentSummary } from '../types';

function isEdited(queryBase: string, refBase: string) {
  return queryBase !== refBase;
}

export function summarizeAlignment(alignedQuery: string, alignedRef: string): AlignmentSummary {
  let mismatchCount = 0;
  let insertionCount = 0;
  let deletionCount = 0;
  let editedRegionCount = 0;
  let inEditedRegion = false;
  let referenceCursor = 0;
  const referenceCoordinates: Array<number | null> = [];

  for (let index = 0; index < alignedQuery.length; index += 1) {
    const queryBase = alignedQuery[index];
    const refBase = alignedRef[index];

    if (refBase === '-') {
      insertionCount += 1;
      referenceCoordinates.push(null);
    } else {
      referenceCoordinates.push(referenceCursor);
      if (queryBase === '-') {
        deletionCount += 1;
      } else if (queryBase !== refBase) {
        mismatchCount += 1;
      }
      referenceCursor += 1;
    }

    if (isEdited(queryBase, refBase)) {
      if (!inEditedRegion) {
        editedRegionCount += 1;
        inEditedRegion = true;
      }
    } else {
      inEditedRegion = false;
    }
  }

  return {
    alignedLength: alignedQuery.length,
    mismatchCount,
    insertionCount,
    deletionCount,
    editedRegionCount,
    hasGap: insertionCount > 0 || deletionCount > 0,
    hasMismatch: mismatchCount > 0,
    referenceCoordinates
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- --run src/lib/__tests__/tsv.test.ts src/lib/__tests__/alignment.test.ts`

Expected: PASS with parser and summary behavior verified.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/lib/tsv.ts src/lib/alignment.ts src/lib/__tests__/tsv.test.ts src/lib/__tests__/alignment.test.ts
git commit -m "feat: add alignment parsing and summary utilities"
```

## Task 4: Build the Main UI Shell and Reference Browser

**Files:**
- Create: `src/components/Toolbar.tsx`
- Create: `src/components/ReferenceStructureView.tsx`
- Create: `src/components/EmptyState.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/components/__tests__/App.test.tsx`

- [ ] **Step 1: Extend the failing app behavior test**

Update `src/components/__tests__/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

test('switches arrays and shows reference structure blocks', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByText('Reference Structure')).toBeInTheDocument();
  expect(screen.getByText('Segment 1')).toBeInTheDocument();

  await user.selectOptions(screen.getByLabelText('Array'), 'RA');

  expect(screen.getByText('Rosa / RA')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: FAIL because the app shell does not render the structure view or controlled array switching.

- [ ] **Step 3: Build the toolbar and reference structure components**

Create `src/components/Toolbar.tsx`:

```tsx
import type { ArrayId } from '../types';

interface ToolbarProps {
  selectedArray: ArrayId;
  onArrayChange: (next: ArrayId) => void;
  queryText: string;
  onQueryTextChange: (value: string) => void;
  totalRows: number;
  visibleRows: number;
}

export default function Toolbar({
  selectedArray,
  onArrayChange,
  queryText,
  onQueryTextChange,
  totalRows,
  visibleRows
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brand">
        <h1>darlin-viewer</h1>
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
      <div className="stats">
        <span>Total rows: {totalRows}</span>
        <span>Visible rows: {visibleRows}</span>
      </div>
    </header>
  );
}
```

Create `src/components/ReferenceStructureView.tsx`:

```tsx
import { deriveReferenceBlocks } from '../lib/referenceLayout';
import type { ReferenceDefinition } from '../types';

interface ReferenceStructureViewProps {
  reference: ReferenceDefinition;
}

export default function ReferenceStructureView({ reference }: ReferenceStructureViewProps) {
  const blocks = deriveReferenceBlocks(reference);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Reference Structure</h2>
        <p>{reference.displayName}</p>
      </div>
      <div className="structure-strip" role="list" aria-label="Reference structure blocks">
        {blocks.map((block) => (
          <button
            key={`${block.type}-${block.start}`}
            type="button"
            className={`structure-block structure-block--${block.type}`}
            title={`${block.label}: ${block.start}-${block.end - 1}`}
          >
            <span>{block.label}</span>
            <small>
              {block.start}-{block.end - 1}
            </small>
          </button>
        ))}
      </div>
      <pre className="reference-sequence">{reference.referenceSequence}</pre>
    </section>
  );
}
```

Create `src/components/EmptyState.tsx`:

```tsx
export default function EmptyState() {
  return (
    <section className="panel empty-state">
      <h2>No alignment selected</h2>
      <p>Upload a TSV file and select a row from the list to inspect the alignment.</p>
    </section>
  );
}
```

Update `src/App.tsx`:

```tsx
import { useMemo, useState } from 'react';
import Toolbar from './components/Toolbar';
import ReferenceStructureView from './components/ReferenceStructureView';
import EmptyState from './components/EmptyState';
import { referencesById } from './data/references';
import type { AlignmentRow, ArrayId } from './types';

export default function App() {
  const [selectedArray, setSelectedArray] = useState<ArrayId>('CA');
  const [queryText, setQueryText] = useState('');
  const [rows] = useState<AlignmentRow[]>([]);

  const reference = referencesById[selectedArray];
  const visibleRows = useMemo(() => rows, [rows]);

  return (
    <main className="app-shell">
      <Toolbar
        selectedArray={selectedArray}
        onArrayChange={setSelectedArray}
        queryText={queryText}
        onQueryTextChange={setQueryText}
        totalRows={rows.length}
        visibleRows={visibleRows.length}
      />
      <div className="workspace">
        <aside className="panel list-panel">
          <h2>Alignment Rows</h2>
          <p>No rows loaded yet.</p>
        </aside>
        <section className="detail-panel">
          <ReferenceStructureView reference={reference} />
          <EmptyState />
        </section>
      </div>
    </main>
  );
}
```

Append to `src/styles.css`:

```css
.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.toolbar,
.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.toolbar {
  display: grid;
  grid-template-columns: 2fr repeat(2, minmax(160px, 220px)) 1fr;
  gap: 16px;
  align-items: end;
  padding: 20px 24px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(320px, 360px) 1fr;
  gap: 20px;
  margin-top: 20px;
}

.list-panel,
.detail-panel {
  min-height: 70vh;
}

.detail-panel {
  display: grid;
  gap: 20px;
}

.panel {
  padding: 20px;
}

.structure-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.structure-block {
  border: 0;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
}

.structure-block--prefix {
  background: #cde7df;
}

.structure-block--segment {
  background: #f4cf8e;
}

.structure-block--pam {
  background: #ecc6b5;
}

.structure-block--postfix {
  background: #d8d8f3;
}

.reference-sequence {
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: "IBM Plex Mono", monospace;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: PASS with array switching and structure rendering verified.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/styles.css src/components/Toolbar.tsx src/components/ReferenceStructureView.tsx src/components/EmptyState.tsx src/components/__tests__/App.test.tsx
git commit -m "feat: add reference browser shell"
```

## Task 5: Implement Upload, List Filtering, and Alignment Detail Rendering

**Files:**
- Create: `src/components/AlignmentList.tsx`
- Create: `src/components/AlignmentDetailView.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/components/Toolbar.tsx`
- Test: `src/components/__tests__/App.test.tsx`

- [ ] **Step 1: Extend the failing app integration test**

Update `src/components/__tests__/App.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

test('uploads TSV rows, filters them, and shows alignment detail for the selected row', async () => {
  const user = userEvent.setup();
  render(<App />);

  const file = new File(
    ['aligned_query\taligned_ref\nAC-G\tACCG\nACTG\tACTG\n'],
    'alignments.tsv',
    { type: 'text/tab-separated-values' }
  );

  await user.upload(screen.getByLabelText('Upload TSV'), file);

  expect(screen.getByText('Total rows: 2')).toBeInTheDocument();

  const rowButton = screen.getByRole('button', { name: /Row 1/ });
  await user.click(rowButton);

  expect(screen.getByText('Alignment Detail')).toBeInTheDocument();
  expect(screen.getByText('Insertion columns: 1')).toBeInTheDocument();

  await user.type(screen.getByLabelText('Search'), 'ACTG');

  const list = screen.getByRole('list', { name: 'Alignment rows' });
  expect(within(list).getAllByRole('button')).toHaveLength(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: FAIL because upload handling, list rendering, and detail rendering do not exist yet.

- [ ] **Step 3: Add upload, list, and detail components**

Update `src/components/Toolbar.tsx`:

```tsx
interface ToolbarProps {
  selectedArray: ArrayId;
  onArrayChange: (next: ArrayId) => void;
  queryText: string;
  onQueryTextChange: (value: string) => void;
  totalRows: number;
  visibleRows: number;
  onFileChange: (file: File | null) => void;
}

// inside the returned markup
<label className="upload-field">
  Upload alignment TSV
  <input
    aria-label="Upload TSV"
    type="file"
    accept=".tsv,text/tab-separated-values"
    onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
  />
</label>
```

Create `src/components/AlignmentList.tsx`:

```tsx
import { summarizeAlignment } from '../lib/alignment';
import type { AlignmentRow } from '../types';

interface AlignmentListProps {
  rows: AlignmentRow[];
  selectedRowId: string | null;
  onSelect: (rowId: string) => void;
}

export default function AlignmentList({ rows, selectedRowId, onSelect }: AlignmentListProps) {
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
```

Create `src/components/AlignmentDetailView.tsx`:

```tsx
import { summarizeAlignment } from '../lib/alignment';
import type { AlignmentRow } from '../types';

interface AlignmentDetailViewProps {
  row: AlignmentRow;
}

function classifyColumn(queryBase: string, refBase: string) {
  if (refBase === '-') return 'insertion';
  if (queryBase === '-') return 'deletion';
  if (queryBase !== refBase) return 'mismatch';
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
```

Update `src/App.tsx`:

```tsx
import { useMemo, useState } from 'react';
import AlignmentDetailView from './components/AlignmentDetailView';
import AlignmentList from './components/AlignmentList';
import EmptyState from './components/EmptyState';
import ReferenceStructureView from './components/ReferenceStructureView';
import Toolbar from './components/Toolbar';
import { referencesById } from './data/references';
import { parseAlignmentTsv } from './lib/tsv';
import type { AlignmentRow, ArrayId } from './types';

export default function App() {
  const [selectedArray, setSelectedArray] = useState<ArrayId>('CA');
  const [queryText, setQueryText] = useState('');
  const [rows, setRows] = useState<AlignmentRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reference = referencesById[selectedArray];
  const visibleRows = useMemo(() => {
    const needle = queryText.trim().toUpperCase();
    if (!needle) return rows;
    return rows.filter(
      (row) =>
        row.alignedQuery.includes(needle) ||
        row.alignedRef.includes(needle)
    );
  }, [queryText, rows]);

  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;

  async function handleFileChange(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
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
          <ReferenceStructureView reference={reference} />
          {selectedRow ? <AlignmentDetailView row={selectedRow} /> : <EmptyState />}
        </section>
      </div>
    </main>
  );
}
```

Append to `src/styles.css`:

```css
.alignment-list {
  display: grid;
  gap: 10px;
}

.alignment-item {
  display: grid;
  gap: 4px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: white;
  padding: 12px;
  text-align: left;
}

.alignment-item.is-selected {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.summary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 16px;
}

.alignment-ruler,
.alignment-track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 18px;
  overflow-x: auto;
  font-family: "IBM Plex Mono", monospace;
}

.base {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 22px;
  border-radius: 4px;
}

.base--match {
  background: #edf2ef;
}

.base--mismatch {
  background: #ffd6a5;
}

.base--insertion {
  background: #bde0fe;
}

.base--deletion {
  background: #ffcad4;
}

.error-banner {
  margin: 16px 0 0;
  border: 1px solid #cc5f4f;
  border-radius: 12px;
  background: #fff1ed;
  color: #8f2d20;
  padding: 12px 16px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: PASS with upload, filtering, selection, and alignment detail behavior verified.

- [ ] **Step 5: Run the full test suite**

Run: `npm run test:run`

Expected: PASS with all parser, reference, alignment, and app interaction tests green.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/styles.css src/components/Toolbar.tsx src/components/AlignmentList.tsx src/components/AlignmentDetailView.tsx src/components/__tests__/App.test.tsx
git commit -m "feat: add alignment browsing workflow"
```

## Task 6: Polish Empty, Error, and Build States

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AlignmentList.tsx`
- Modify: `src/components/ReferenceStructureView.tsx`
- Modify: `src/styles.css`
- Test: `src/components/__tests__/App.test.tsx`

- [ ] **Step 1: Write the failing regression test for invalid TSV**

Append to `src/components/__tests__/App.test.tsx`:

```tsx
test('shows a row-level validation error for malformed uploads', async () => {
  const user = userEvent.setup();
  render(<App />);

  const file = new File(['aligned_query\taligned_ref\nACGT\tACG\n'], 'bad.tsv', {
    type: 'text/tab-separated-values'
  });

  await user.upload(screen.getByLabelText('Upload TSV'), file);

  expect(screen.getByText('Row 1: aligned_query and aligned_ref must have equal length')).toBeInTheDocument();
  expect(screen.getByText('No rows loaded yet.')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: FAIL if the UI does not preserve a clean empty state after upload validation fails.

- [ ] **Step 3: Tighten the empty and error-state UI**

Update `src/components/AlignmentList.tsx` to render an explicit empty message when `rows.length === 0`:

```tsx
if (rows.length === 0) {
  return (
    <section className="panel list-panel">
      <h2>Alignment Rows</h2>
      <p>No rows loaded yet.</p>
    </section>
  );
}
```

Update `src/components/ReferenceStructureView.tsx` to add a compact legend:

```tsx
<div className="structure-legend">
  <span>Prefix</span>
  <span>Segment</span>
  <span>PAM</span>
  <span>Postfix</span>
</div>
```

Update `src/App.tsx` so a filter that removes the currently selected row falls back to the first visible row:

```tsx
const selectedRow =
  visibleRows.find((row) => row.id === selectedRowId) ??
  visibleRows[0] ??
  null;
```

Append to `src/styles.css`:

```css
.structure-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 0.9rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/__tests__/App.test.tsx`

Expected: PASS with the malformed-upload regression covered.

- [ ] **Step 5: Build the app**

Run: `npm run build`

Expected: PASS with a production bundle emitted to `dist/`.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/AlignmentList.tsx src/components/ReferenceStructureView.tsx src/styles.css src/components/__tests__/App.test.tsx
git commit -m "fix: polish darlin-viewer empty and error states"
```

## Self-Review

### Spec Coverage

- Built-in `CA/TA/RA` definitions: Task 2
- TSV upload with `aligned_query` and `aligned_ref`: Task 5
- Headered and headerless TSV parsing: Task 3
- Row-level validation errors: Tasks 3 and 6
- List + detail workflow: Task 5
- Reference structure rendering with block coloring and coordinates: Task 4
- Alignment detail with mismatches, insertions, deletions, and coordinate ruler: Task 5
- Empty state and no-backend architecture: Tasks 4, 5, and 6

### Placeholder Scan

- No `TODO`, `TBD`, or unresolved literal placeholders remain in the implementation steps.

### Type Consistency

- `AlignmentRow`, `AlignmentSummary`, `ReferenceDefinition`, and `StructuralBlock` names are defined once in `src/types.ts` and reused consistently across parser, layout, and UI tasks.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-07-darlin-view.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
