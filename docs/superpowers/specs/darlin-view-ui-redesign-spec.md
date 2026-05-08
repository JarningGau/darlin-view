# darlin-viewer UI Redesign Spec

## Goal

Redesign the current `darlin-viewer` UI to look more like a scientific
sequence/alignment browser rather than a generic dashboard.

Target visual references:

-   IGV / genome browser style
-   UCSC Genome Browser style
-   cellxgene-style neutral scientific interface

Core design principles:

-   High information density
-   Neutral academic visual language
-   Clear visual hierarchy
-   Minimal decorative color
-   Monospace sequence rendering
-   Export/figure-friendly layout

------------------------------------------------------------------------

## 1. Global style

### Background

Replace warm beige background with neutral scientific colors.

Use:

``` css
--bg-page: #FAFAFA;
--bg-panel: #FFFFFF;
--border-subtle: #E5E7EB;
--border-strong: #D1D5DB;
--text-main: #111827;
--text-muted: #6B7280;
--text-soft: #9CA3AF;
--accent: #1F2937;
--accent-blue: #2563EB;
```

Page:

``` css
body {
  background: var(--bg-page);
  color: var(--text-main);
  font-family: Inter, system-ui, sans-serif;
}
```

Sequence/alignment text must use monospace.

------------------------------------------------------------------------

## 2. Remove overly rounded SaaS styling

Change:

``` css
border-radius: 12px;
```

to:

``` css
border-radius: 4px;
```

Panels:

``` css
.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}
```

Avoid heavy shadows.

------------------------------------------------------------------------

## 3. Header layout

Refactor header into:

``` text
[Title + subtitle] [Controls] [Import]
```

Layout:

``` text
darlin-viewer
Interactive DARLIN reference and alignment browser

Array: [CA v]   Search: [Filter by aligned sequence................]

Import alignment:
[Choose file] [Upload] [Clear]

Paste TSV:
[textarea........................................] [Submit TSV]
```

Compact horizontal workflow.

------------------------------------------------------------------------

## 4. Controls

Use compact rectangular controls.

Primary button:

``` css
.btn-primary {
  background: var(--accent);
  color: white;
}
```

Secondary button:

``` css
.btn-secondary {
  background: white;
  border: 1px solid var(--border-strong);
}
```

Avoid green as default action color.

------------------------------------------------------------------------

## 5. Dataset summary

Replace badge pills:

``` text
Total rows: 1
Visible rows: 1
```

With:

``` text
n = 1 alignments · filtered = 1
```

Compact scientific notation.

------------------------------------------------------------------------

## 6. Main layout

Two-panel layout:

``` text
| sidebar: alignment table | main: alignment detail |
```

CSS:

``` css
.main {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 16px;
}
```

------------------------------------------------------------------------

## 7. Sidebar redesign

Replace card list with compact table.

Columns:

``` text
Row | Sequence prefix | Mismatch | Indel
```

Selected row:

``` css
tr.selected {
  background: #EEF2FF;
  outline: 1px solid #6366F1;
}
```

------------------------------------------------------------------------

## 8. Alignment detail panel

Header:

``` text
Alignment detail                                      Row 1
```

Panel title:

``` css
.panel-title {
  font-size: 18px;
  font-weight: 600;
}
```

------------------------------------------------------------------------

## 9. Mutation annotation redesign

Convert long annotation string into tags.

Example:

``` text
[24–62 del] [77–80 del] [96–130 ins]
```

Semantic color system:

-   deletion → red
-   insertion → blue
-   mismatch → amber

Each tag remains copyable.

------------------------------------------------------------------------

## 10. Alignment track redesign

Track layout:

``` text
coordinate ruler
REF  sequence
READ sequence
```

Fixed labels:

``` text
REF
READ
```

Grid-based track rows.

------------------------------------------------------------------------

## 11. Base color system

Use fixed nucleotide colors.

A:

``` text
green
```

T:

``` text
red
```

C:

``` text
blue
```

G:

``` text
amber
```

Gap:

``` text
gray
```

Rules:

-   pale background
-   dark letters
-   mismatch = outlined
-   insertion = underline
-   deletion = gray gap

------------------------------------------------------------------------

## 12. Coordinate ruler

Add stronger coordinate visualization.

Major tick every 10 bp.

Example:

``` text
1         10        20        30
|.........|.........|.........|
```

------------------------------------------------------------------------

## 13. Optional overview minimap

Add mutation-density overview.

Example:

``` text
Overview: |----del----|--ins--|-----del-----|
```

Purpose:

-   fast navigation
-   mutation density preview

------------------------------------------------------------------------

## 14. Export actions

Add:

``` text
Copy annotation | Export SVG | Export PNG
```

SVG export is especially useful for publication.

------------------------------------------------------------------------

## 15. Accessibility

Requirements:

-   aria-label for buttons
-   selected rows not indicated by color alone
-   mutation tags include text labels

------------------------------------------------------------------------

## 16. Component structure

Recommended:

``` text
Header
MainLayout
  AlignmentSidebar
  AlignmentDetail
    MutationTagStrip
    CoordinateRuler
    AlignmentTrack
```

Reusable components:

``` tsx
<BaseCell />
<CoordinateRuler />
<MutationTag />
```

------------------------------------------------------------------------

## 17. Parsing mutation annotation

Pseudo-code:

``` ts
function parseMutationAnnotation(annotation: string) {
  return annotation.split(",").map(x => x.trim());
}
```

Map to:

-   del
-   ins
-   mismatch

------------------------------------------------------------------------

## 18. Acceptance criteria

UI is accepted when:

-   neutral white background
-   rectangular controls
-   monospace sequence
-   table sidebar
-   tag-based mutation annotation
-   REF/READ labels
-   stronger coordinate ruler
-   stable nucleotide palette
-   scientific browser aesthetic

------------------------------------------------------------------------

## Non-goals

Do not modify:

-   alignment parsing logic
-   biological interpretation
-   backend API
-   data model

Only UI and UX refactor.
