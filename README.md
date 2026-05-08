# darlin-viewer

`darlin-viewer` is a local React/Vite web app for browsing DARLIN reference arrays and inspecting precomputed `query/ref` alignment results.

Current scope:

- built-in `CA`, `TA`, and `RA` reference definitions
- reference structure visualization with conserved, cutsite, and PAM context
- TSV upload or paste input for `aligned_query` / `aligned_ref`
- row list, search, and per-row alignment detail view
- mutation annotation generation and copy-to-clipboard actions

## Requirements

- Node.js 20+
- npm 11+

## Install

```bash
npm install
```

## Run

Start the local development server:

```bash
npm run dev
```

Then open the local URL printed by Vite, usually `http://localhost:5173`.

To build a production bundle:

```bash
npm run build
```

To run tests:

```bash
npm run test:run
```

For watch mode while developing:

```bash
npm test
```

## Configuration

This version does not use an external config file.

The app is configured through two built-in assumptions:

1. Reference array choice
   Choose one of `CA`, `TA`, or `RA` from the top toolbar.

2. Uploaded TSV format
   Upload or paste TSV content containing aligned sequence pairs.

If you want to change the built-in reference definitions, edit [`src/data/references.ts`](src/data/references.ts).

## TSV Input Format

The app accepts either:

- headered TSV with columns `aligned_query` and `aligned_ref`
- headerless TSV where column 1 is `aligned_query` and column 2 is `aligned_ref`

Each row is one alignment.

Example with header:

```tsv
aligned_query	aligned_ref
AC-GT	ACCGT
ACTGA	ACTGA
```

Example without header:

```tsv
AC-GT	ACCGT
ACTGA	ACTGA
```

Validation rules:

- both columns must be present
- neither column can be empty
- `aligned_query` and `aligned_ref` must have equal length
- allowed characters are `A`, `C`, `G`, `T`, `N`, and `-`

If a row is invalid, the UI shows a row-level error message.

## How To Use

1. Run `npm run dev`.
2. Open the local app in your browser.
3. Choose the target array: `CA`, `TA`, or `RA`.
4. Upload a TSV file or paste TSV content with `aligned_query` and `aligned_ref`.
5. Browse rows in the left panel.
6. Use the `Search` box to filter rows by substring.
7. Click a row to inspect its alignment detail on the right.

## What The UI Shows

### Alignment List

The left panel shows:

- row number
- short aligned-query preview
- mismatch count
- gap summary

### Alignment Detail

The detail panel shows:

- aligned reference row
- aligned query row
- coordinate ruler
- reference context for conserved, cutsite, and PAM regions
- mismatch, insertion, deletion, and complex edit highlighting
- summary counts for aligned length, mismatches, insertion columns, deletion columns, and edited regions
- mutation annotations such as `12_14del`, `12_14delinsAC`, or `12_13insG`
- copy buttons for the full annotation string and individual mutation tags
- selected reference structure with block coordinates

Current edit semantics:

- insertion: `aligned_ref` is `-`
- deletion: `aligned_query` is `-`
- mismatch: both aligned bases are present and different
- complex edit: one contiguous edited region contains more than one basic mutation type

Mutation annotations use 1-based reference coordinates. Adjacent mutation events within three reference bases are merged into a single `delins` annotation.

## Notes

- `darlin-viewer` does not compute alignments itself. Upload precomputed alignment results.
- The app does not infer whether your TSV belongs to `CA`, `TA`, or `RA`; you must choose the correct array manually.
- There is no backend in this version. All parsing and rendering happen in the browser.
- SVG and PNG export buttons are present as disabled placeholders for a future release.

## Development

Important source files:

- [`src/App.tsx`](src/App.tsx): top-level app state and import flow
- [`src/components/Toolbar.tsx`](src/components/Toolbar.tsx): array selection, search, TSV upload, and TSV paste controls
- [`src/components/AlignmentList.tsx`](src/components/AlignmentList.tsx): filtered row list and row summaries
- [`src/components/AlignmentDetailView.tsx`](src/components/AlignmentDetailView.tsx): mutation annotations, alignment tracks, and reference context
- [`src/data/references.ts`](src/data/references.ts): built-in `CA/TA/RA` definitions
- [`src/lib/tsv.ts`](src/lib/tsv.ts): TSV parsing and validation
- [`src/lib/alignment.ts`](src/lib/alignment.ts): alignment summary, coordinate mapping, and mutation annotation generation
- [`src/lib/referenceLayout.ts`](src/lib/referenceLayout.ts): reference block derivation
