# darlin-view

`darlin-view` is a local web app for browsing DARLIN reference arrays and inspecting precomputed `query/ref` alignment results.

Current scope:

- built-in `CA`, `TA`, and `RA` reference definitions
- reference structure visualization
- TSV upload for `aligned_query` / `aligned_ref`
- row list, search, and per-row alignment detail view

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

## Configuration

This first version does not use an external config file.

The app is configured through two built-in assumptions:

1. Reference array choice
   Choose one of `CA`, `TA`, or `RA` from the top toolbar.

2. Uploaded TSV format
   Upload a TSV file containing aligned sequence pairs.

If you want to change the built-in reference definitions, edit [src/data/references.ts](/home/jarning/test/darlin-view/src/data/references.ts:1).

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
4. Upload a TSV file with `aligned_query` and `aligned_ref`.
5. Browse rows in the left panel.
6. Use the `Search` box to filter rows by substring.
7. Click a row to inspect its alignment detail on the right.

## What The UI Shows

### Reference Structure

The top-right panel shows the selected built-in reference:

- `Prefix`
- `Segment 1..10`
- `PAM 1..10`
- `Postfix`

It also shows the full reference sequence below the structure blocks.

### Alignment List

The left panel shows:

- row number
- short aligned-query preview
- mismatch count
- gap summary

### Alignment Detail

The bottom-right panel shows:

- aligned reference row
- aligned query row
- coordinate ruler
- mismatch / insertion / deletion highlighting
- summary counts for aligned length, mismatches, insertion columns, deletion columns, and edited regions

Current edit semantics:

- insertion: `aligned_ref` is `-`
- deletion: `aligned_query` is `-`

## Notes

- `darlin-view` does not compute alignments itself. Upload precomputed alignment results.
- The app does not infer whether your TSV belongs to `CA`, `TA`, or `RA`; you must choose the correct array manually.
- There is no backend in this version. All parsing and rendering happen in the browser.

## Development

Important source files:

- [src/App.tsx](/home/jarning/test/darlin-view/src/App.tsx:1): top-level app state and upload flow
- [src/data/references.ts](/home/jarning/test/darlin-view/src/data/references.ts:1): built-in `CA/TA/RA` definitions
- [src/lib/tsv.ts](/home/jarning/test/darlin-view/src/lib/tsv.ts:1): TSV parsing and validation
- [src/lib/alignment.ts](/home/jarning/test/darlin-view/src/lib/alignment.ts:1): alignment summary and coordinate mapping
