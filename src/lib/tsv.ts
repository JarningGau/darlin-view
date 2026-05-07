import Papa from 'papaparse';
import type { AlignmentRow } from '../types';

const VALID_SEQUENCE = /^[ACGTN-]+$/;

export function parseAlignmentTsv(text: string): AlignmentRow[] {
  const normalized = text.trim();
  if (!normalized) {
    throw new Error('Upload is empty');
  }

  const parsed = Papa.parse<string[]>(normalized, {
    delimiter: '\t',
    skipEmptyLines: true
  });

  const rows = parsed.data;
  if (rows.length === 0) {
    throw new Error('Upload is empty');
  }

  const [firstRow] = rows;
  const hasHeader = firstRow[0] === 'aligned_query' && firstRow[1] === 'aligned_ref';
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows.map((row, index) => {
    const rowNumber = index + 1;
    const alignedQuery = row[0];
    const alignedRef = row[1];

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
