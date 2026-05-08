export type ExportColumnState = 'insertion' | 'deletion' | 'mismatch' | 'match' | 'complex';

export interface ExportColumn {
    queryBase: string;
    refBase: string;
    state: ExportColumnState;
    coordinate: number | null;
    isConsite: boolean;
    isCutsite: boolean;
    isPam: boolean;
}

export interface ExportAlignmentSvgOptions {
    title: string;
    rowLabel: string;
    mutationAnnotation: string;
    segments: ExportColumn[][];
    cellWidth: number;
    trackLabelWidth: number;
    trackLabelGap: number;
    overviewCellWidth: number;
    overviewCellGap: number;
    margin: number;
}

const DEFAULTS: Omit<ExportAlignmentSvgOptions, 'segments' | 'title' | 'rowLabel' | 'mutationAnnotation'> = {
    cellWidth: 27,
    trackLabelWidth: 72,
    trackLabelGap: 10,
    overviewCellWidth: 3,
    overviewCellGap: 1,
    margin: 18
};

function wrapTextByChars(text: string, maxChars: number) {
    const normalized = text.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
    const lines: string[] = [];
    for (const rawLine of normalized.split('\n')) {
        const line = rawLine.trimEnd();
        if (!line) {
            lines.push('');
            continue;
        }
        for (let i = 0; i < line.length; i += maxChars) {
            lines.push(line.slice(i, i + maxChars));
        }
    }
    return lines;
}

function escapeXml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function colorForState(state: ExportColumnState) {
    switch (state) {
        case 'insertion':
            return '#2563eb';
        case 'deletion':
            return '#dc2626';
        case 'mismatch':
            return '#d97706';
        case 'complex':
            return '#7c3aed';
        case 'match':
        default:
            return '#9ca3af';
    }
}

function overviewColorForState(state: ExportColumnState) {
    switch (state) {
        case 'insertion':
            return 'rgba(37, 99, 235, 0.7)';
        case 'deletion':
            return 'rgba(239, 68, 68, 0.7)';
        case 'mismatch':
            return 'rgba(245, 158, 11, 0.65)';
        case 'complex':
            return 'rgba(124, 58, 237, 0.75)';
        case 'match':
        default:
            return 'rgba(17, 24, 39, 0.08)';
    }
}

function contextColorForColumn(column: ExportColumn) {
    if (column.isCutsite) return '#ef4444';
    if (column.isPam) return '#3b82f6';
    if (column.isConsite) return '#f59e0b';
    return 'transparent';
}

export function buildAlignmentSvg(input: ExportAlignmentSvgOptions): { svg: string; width: number; height: number } {
    const options: ExportAlignmentSvgOptions = { ...DEFAULTS, ...input };
    const reserved = options.trackLabelWidth + options.trackLabelGap;
    const maxCols = options.segments.reduce((max, seg) => Math.max(max, seg.length), 0);
    const tracksWidth = maxCols * options.cellWidth;
    const width = options.margin * 2 + reserved + tracksWidth;

    const annotationText = options.mutationAnnotation?.trim().length ? options.mutationAnnotation.trim() : 'None';
    const maxChars = Math.max(20, Math.floor((width - options.margin * 2) / 8));
    const annotationLines = wrapTextByChars(annotationText, maxChars);
    const annotationLineHeight = 14;
    const annotationBlockTopGap = 8;
    const annotationLabelHeight = 16;
    const annotationBottomGap = 14;
    const headerHeight =
        44 +
        annotationBlockTopGap +
        annotationLabelHeight +
        Math.max(1, annotationLines.length) * annotationLineHeight +
        annotationBottomGap;
    const segmentGap = 18;
    const overviewHeight = 18;
    const rulerHeight = 24;
    const contextHeight = 14;
    const rowHeight = 28;

    const segmentHeight = overviewHeight + rulerHeight + contextHeight + rowHeight * 2 + 14;
    const height = options.margin * 2 + headerHeight + options.segments.length * segmentHeight + Math.max(0, options.segments.length - 1) * segmentGap;

    const title = escapeXml(options.title);
    const rowLabel = escapeXml(options.rowLabel);

    let y = options.margin;
    const parts: string[] = [];

    parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    parts.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    );
    parts.push(
        `<style>
            .title { font: 700 16px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; fill: #111827; }
            .subtitle { font: 600 12px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; fill: #6b7280; }
            .label { font: 700 11px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; fill: #6b7280; }
            .mono { font: 600 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
            .monoSmall { font: 600 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; fill: #111827; }
            .ruler { font: 600 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; fill: #6b7280; }
            .rulerMajor { fill: #111827; }
        </style>`
    );

    parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />`);
    parts.push(`<text x="${options.margin}" y="${y + 18}" class="title">${title}</text>`);
    parts.push(`<text x="${options.margin}" y="${y + 36}" class="subtitle">${rowLabel}</text>`);

    const annoLabelY = y + 44 + annotationBlockTopGap + 12;
    parts.push(`<text x="${options.margin}" y="${annoLabelY}" class="label">Mutation annotation</text>`);

    const annoTextStartY = annoLabelY + annotationLabelHeight;
    const annoX = options.margin;
    annotationLines.forEach((line, idx) => {
        const yLine = annoTextStartY + idx * annotationLineHeight;
        parts.push(`<text x="${annoX}" y="${yLine}" class="monoSmall">${escapeXml(line)}</text>`);
    });
    y += headerHeight;

    const labelX = options.margin;
    const trackX = options.margin + reserved;

    for (let s = 0; s < options.segments.length; s += 1) {
        const seg = options.segments[s];
        const segWidth = seg.length * options.cellWidth;

        // Overview
        parts.push(`<text x="${labelX}" y="${y + 14}" class="label">Overview</text>`);
        const ovY = y + 4;
        for (let i = 0; i < seg.length; i += 1) {
            const state = seg[i]?.state ?? 'match';
            const x = trackX + i * (options.overviewCellWidth + options.overviewCellGap);
            parts.push(
                `<rect x="${x}" y="${ovY}" width="${options.overviewCellWidth}" height="10" rx="0" fill="${overviewColorForState(
                    state
                )}" />`
            );
        }

        // Ruler (major every 1, but only show actual coordinates)
        const rulerY = y + overviewHeight;
        parts.push(`<text x="${labelX}" y="${rulerY + 16}" class="label">Ruler</text>`);
        for (let i = 0; i < seg.length; i += 1) {
            const col = seg[i];
            const pos = col.coordinate !== null ? col.coordinate + 1 : null;
            if (pos === null) continue;
            const x = trackX + i * options.cellWidth + options.cellWidth / 2;
            parts.push(
                `<text x="${x}" y="${rulerY + 18}" text-anchor="middle" class="ruler rulerMajor">${pos}</text>`
            );
        }

        // Context pills (match UI: 27x6 rounded rect)
        const ctxY = rulerY + rulerHeight;
        parts.push(`<text x="${labelX}" y="${ctxY + 12}" class="label">Context</text>`);
        for (let i = 0; i < seg.length; i += 1) {
            const col = seg[i];
            const fill = contextColorForColumn(col);
            if (fill === 'transparent') continue;
            const x = trackX + i * options.cellWidth;
            const yRect = ctxY + 2;
            const h = 6;
            parts.push(
                `<rect x="${x}" y="${yRect}" width="${options.cellWidth}" height="${h}" rx="0" ry="0" fill="${fill}" />`
            );
        }

        // Reference bases
        const refY = ctxY + contextHeight;
        parts.push(`<text x="${labelX}" y="${refY + 20}" class="label">Reference</text>`);
        for (let i = 0; i < seg.length; i += 1) {
            const col = seg[i];
            const x = trackX + i * options.cellWidth + options.cellWidth / 2;
            parts.push(
                `<text x="${x}" y="${refY + 22}" text-anchor="middle" class="mono" fill="${colorForState(
                    col.state
                )}">${escapeXml(col.refBase)}</text>`
            );
        }

        // Query bases
        const queryY = refY + rowHeight;
        parts.push(`<text x="${labelX}" y="${queryY + 20}" class="label">Query</text>`);
        for (let i = 0; i < seg.length; i += 1) {
            const col = seg[i];
            const x = trackX + i * options.cellWidth + options.cellWidth / 2;
            parts.push(
                `<text x="${x}" y="${queryY + 22}" text-anchor="middle" class="mono" fill="${colorForState(
                    col.state
                )}">${escapeXml(col.queryBase)}</text>`
            );
        }

        y += segmentHeight + segmentGap;

        // trim last gap visually by not drawing anything; actual height already includes it
        if (s === options.segments.length - 1) {
            // no-op
        }

        // Ensure we don't leave huge empty width when segment is shorter
        if (segWidth < tracksWidth) {
            // no-op; viewBox/width keeps consistent for all segments
        }
    }

    parts.push(`</svg>`);
    return { svg: parts.join(''), width, height };
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export function downloadSvg(svgText: string, filename: string) {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, filename);
}

export async function downloadPngFromSvg(svgText: string, filename: string, opts?: { scale?: number }) {
    const scale = Math.max(1, opts?.scale ?? 2);
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Could not render SVG'));
            img.src = url;
        });

        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas not supported');
        }

        // white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        const pngBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) reject(new Error('Could not encode PNG'));
                else resolve(blob);
            }, 'image/png');
        });

        triggerDownload(pngBlob, filename);
    } finally {
        URL.revokeObjectURL(url);
    }
}

