# darlin-viewer Design Spec

## Overview

`darlin-viewer` is a local web application for visualizing DARLIN reference arrays and browsing query-to-reference alignment results. The first version focuses on interactive inspection, not sequence analysis. It treats alignment results as precomputed input and renders them against built-in definitions for the three supported DARLIN arrays:

- `CA`
- `TA`
- `RA`

The app has two primary jobs:

1. Show the reference sequence and its structural annotation for the selected array
2. Show uploaded `aligned_query` / `aligned_ref` pairs as browsable alignment rows with a detailed per-row view

## Goals

### In Scope

- Local browser-based application
- Built-in reference definitions for `CA`, `TA`, and `RA`
- TSV upload containing one alignment per row
- Result list with filtering and selection
- Structural reference view with sequence coordinates
- Alignment detail view for the selected row
- Visual highlighting for matches, mismatches, insertions, and deletions

### Out of Scope for V1

- Running alignment in the browser
- Mutation calling or HGVS annotation
- Phylogeny, clone aggregation, or lineage tree views
- Sample-level biological summaries beyond simple row counts
- Report export, image export, or shareable hosted output
- Backend services or database storage

## Users and Workflow

The expected user is a researcher who already has DARLIN alignment output and wants to inspect:

- how a selected array is structured
- where edits fall relative to the reference
- how multiple aligned rows differ at a glance before opening a single row in detail

Primary workflow:

1. Open the app locally in a browser
2. Choose `CA`, `TA`, or `RA`
3. Upload a TSV file containing alignment results
4. Scan the list of alignments
5. Select one row
6. Inspect the selected row against the built-in reference structure

## Input Model

The application ships with built-in reference definitions for:

- `CA`
- `TA`
- `RA`

Each reference definition must include:

- `id`
- `displayName`
- `referenceSequence`
- `prefix`
- `segments`
- `pam`
- `postfix`

The app derives structural spans from the built-in definition and exposes them as typed blocks:

- `prefix`
- `segment`
- `pam`
- `postfix`

Each structural block must have:

- block type
- label
- zero-based start coordinate on the ungapped reference
- zero-based end coordinate on the ungapped reference
- sequence text

### Uploaded TSV

The uploaded TSV file contains one alignment result per row.

Required columns:

- `aligned_query`
- `aligned_ref`

Compatibility rules:

- Headered TSV is supported if those two names are present
- Headerless TSV is supported by mapping column 1 to `aligned_query` and column 2 to `aligned_ref`
- Extra columns may be ignored in V1

Validation rules:

- both required fields must be present
- neither field may be empty
- `aligned_query.length` must equal `aligned_ref.length`
- characters must be limited to `A`, `C`, `G`, `T`, `N`, and `-`

Validation failure must produce a clear upload error that includes the row number and reason.

## Product Structure

The interface is a two-pane browser application.

### Top Toolbar

The toolbar contains:

- array selector: `CA`, `TA`, `RA`
- TSV upload control
- simple text search input
- lightweight dataset stats such as total rows and visible rows

### Left Pane: Alignment List

The left pane shows one list item per alignment row.

Each item includes:

- row index
- short preview of the alignment
- basic edit summary
- length metadata if useful

The list supports:

- free-text filtering
- basic filtering such as "contains gap" or "contains mismatch"
- row selection

The list is the navigation layer. It does not need to render full sequence detail.

### Right Pane: Detail Workspace

The detail workspace has two stacked sections.

#### Reference Structure View

This section shows the selected built-in array and its structural annotation.

Requirements:

- color-code `prefix`, `segment`, `pam`, and `postfix`
- show coordinates relative to the ungapped reference
- support hover to reveal block label and coordinates
- support click-to-focus on a structural block
- support both compact block view and expanded base-level sequence view

#### Alignment Detail View

This section shows the selected alignment row.

Requirements:

- one line for `aligned_ref`
- one line for `aligned_query`
- shared horizontal positioning
- reference coordinate ruler above the alignment
- synchronized horizontal scrolling for ruler and sequence rows
- visual highlighting for:
  - match
  - mismatch
  - insertion: `aligned_ref` is `-`
  - deletion: `aligned_query` is `-`

The detail view also shows a compact summary for the selected row:

- total aligned length
- mismatch count
- insertion column count
- deletion column count
- count of contiguous edited regions

## Interaction Model

### Array Switching

Changing the selected array updates:

- the reference structure view
- the semantic coordinate context used in the detail panel

Uploaded rows remain loaded, but the user is responsible for uploading rows that correspond to the selected reference. V1 does not attempt to infer array identity from the uploaded file.

### Row Selection

Selecting a row in the left pane updates the right-side alignment detail immediately.

If no row is selected:

- the reference structure remains visible
- the alignment detail area shows an empty state prompting the user to select a row

### Search and Filter

V1 search may be simple substring matching against:

- `aligned_query`
- `aligned_ref`

V1 filtering may be derived from alignment content:

- has any gap
- has any mismatch
- exact match only

This is sufficient for first release and avoids over-designing analysis logic.

## Rendering Rules

### Coordinate Semantics

Reference coordinates are defined on the ungapped built-in reference sequence, not on the gapped uploaded alignment strings.

The alignment detail view must preserve both:

- alignment column index for rendering
- mapped reference coordinate where applicable

Columns where `aligned_ref` is `-` do not advance the reference coordinate.

### Color System

V1 should use a restrained, legible palette with strong contrast between:

- structural annotation colors
- alignment edit-state colors

The structure palette and edit-state palette must stay visually distinct so users do not confuse "array anatomy" with "alignment difference type".

### Performance

V1 should comfortably handle typical TSV files containing at least hundreds of alignment rows without noticeable interaction lag.

If list rendering becomes expensive, use windowing for the left pane. This is an implementation choice, not a product requirement.

## Error Handling

The app must handle:

- unsupported file format
- malformed TSV rows
- missing required columns
- unequal alignment string lengths
- illegal characters
- empty upload

Errors should be shown in the UI as actionable messages, not silent failures or console-only logs.

## Testing Strategy

The implementation should include tests for:

- TSV parsing with headered input
- TSV parsing with headerless input
- validation errors with row-level reporting
- reference span derivation from built-in definitions
- alignment summary calculations
- alignment coordinate mapping behavior around gaps
- list-to-detail selection flow

UI-level tests should focus on behavior rather than pixel-perfect layout.

## Implementation Notes

The app should be built as a frontend-only local web application. A TypeScript-based React stack is the recommended implementation path because:

- the product is interaction-heavy
- sequence browsing benefits from component boundaries
- parsing, filtering, and rendering can all stay client-side

The design intentionally separates:

- built-in biological reference definitions
- uploaded alignment data
- derived visual state

This keeps V1 focused on browsing instead of analysis.

## Deferred Items

The following are reasonable future extensions but are intentionally deferred:

- compressed "differences only" alignment mode
- biological event annotation tracks
- exportable snapshots
- multi-row comparative detail view
- integration with `darlinpy` or other upstream analysis outputs beyond the two required columns
