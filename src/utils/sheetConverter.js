import { ASSET_COLUMNS, SHEET1_HEADERS } from '../constants/assets';
import { generateTagNo } from './tagGenerator';

/**
 * Format asset value: default stores asset label name if checked, or blank if unchecked
 */
export function formatAssetValue(isActive, format = 'LABEL', assetLabel = '') {
  if (!isActive) {
    if (format === 'TRUE_FALSE') return 'FALSE';
    if (format === 'YES_NO') return 'NO';
    if (format === '1_0') return '0';
    return '';
  }

  switch (format) {
    case 'LABEL':
      return assetLabel;
    case 'TRUE_FALSE':
      return 'TRUE';
    case 'YES_NO':
      return 'YES';
    case '1_0':
      return '1';
    case 'CHECKMARK':
      return '✓';
    default:
      return assetLabel || 'TRUE';
  }
}

/**
 * Check if a raw cell value represents an allocated asset:
 * Non-empty string (like 'MONITER', 'CPU', 'TRUE', '1', etc.) is true, blank is false.
 */
export function isValueTruthy(val, assetLabel = '') {
  if (val === true || val === 1) return true;
  if (!val) return false;
  const str = String(val).trim();
  if (str.length === 0) return false;

  const upper = str.toUpperCase();
  if (['FALSE', '0', 'NO', 'N', 'OFF', 'NONE'].includes(upper)) {
    return false;
  }
  // Any label name, true, yes, 1, or checkmark is active
  return true;
}

/**
 * Generate CSV text with exact columns
 */
export function generateSheetCsv(records, format = 'LABEL') {
  const lines = [];

  // Header row
  lines.push(SHEET1_HEADERS.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const rec of records) {
    const rowValues = [
      rec.tagNo || '',
      rec.entity || '',
      rec.location || '',
      rec.userName || '',
      ...ASSET_COLUMNS.map(col =>
        formatAssetValue(Boolean(rec.assets?.[col.key]), format, col.label)
      )
    ];

    const escapedRow = rowValues.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    lines.push(escapedRow);
  }

  return lines.join('\r\n');
}

/**
 * Generate TSV (Tab-Separated) text
 */
export function generateSheetTsv(records, format = 'LABEL') {
  const lines = [];

  // Header row
  lines.push(SHEET1_HEADERS.join('\t'));

  // Data rows
  for (const rec of records) {
    const rowValues = [
      rec.tagNo || '',
      rec.entity || '',
      rec.location || '',
      rec.userName || '',
      ...ASSET_COLUMNS.map(col =>
        formatAssetValue(Boolean(rec.assets?.[col.key]), format, col.label)
      )
    ];

    lines.push(rowValues.join('\t'));
  }

  return lines.join('\n');
}

/**
 * Trigger browser file download of CSV
 */
export function downloadCsvFile(records, filename = 'Asset_Registry.csv', format = 'LABEL') {
  const csvContent = '\uFEFF' + generateSheetCsv(records, format);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse lines from CSV or TSV string, handling quotes and commas/tabs
 */
function parseRow(text, delimiter) {
  const entries = [];
  let entry = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        entry += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      entries.push(entry);
      entry = '';
    } else {
      entry += c;
    }
  }
  entries.push(entry);
  return entries.map(s => s.trim());
}

/**
 * Parse CSV or TSV pasted from Google Sheet
 */
export function parseGoogleSheetText(rawText, existingRecords = []) {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'Empty text provided', records: [] };
  }

  // Detect delimiter: tab or comma
  const sampleLines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (sampleLines.length === 0) {
    return { success: false, error: 'No data lines found', records: [] };
  }

  const firstLine = sampleLines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = tabCount >= commaCount ? '\t' : ',';

  const rows = sampleLines.map(line => parseRow(line, delimiter));
  if (rows.length === 0) {
    return { success: false, error: 'Unable to parse rows', records: [] };
  }

  let dataRows = rows;
  const headerRow = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Detect if first row is header
  const isHeaderPresent = headerRow.some(
    h => h.includes('tag') || h.includes('entity') || h.includes('location') || h.includes('user') || h.includes('asset')
  );

  let columnIndices = {
    tagNo: 0,
    entity: 1,
    location: 2,
    userName: 3
  };

  const assetIndices = {};

  if (isHeaderPresent) {
    dataRows = rows.slice(1);
    rows[0].forEach((col, idx) => {
      const clean = col.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.includes('tag')) columnIndices.tagNo = idx;
      else if (clean.includes('entity')) columnIndices.entity = idx;
      else if (clean.includes('location') || clean.includes('loc')) columnIndices.location = idx;
      else if (clean.includes('user') || clean.includes('name') || clean.includes('emp')) columnIndices.userName = idx;
      
      // Match Asset1..Asset14 or asset labels like MONITER, CPU, etc.
      ASSET_COLUMNS.forEach((asset, aIdx) => {
        const keyClean = asset.key.toLowerCase();
        const labelClean = asset.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean === keyClean || clean.includes(labelClean)) {
          assetIndices[asset.key] = idx;
        }
      });
    });
  } else {
    // Standard default positioning 0..17
    columnIndices = { tagNo: 0, entity: 1, location: 2, userName: 3 };
    ASSET_COLUMNS.forEach((col, idx) => {
      assetIndices[col.key] = 4 + idx;
    });
  }

  // Ensure all 14 asset columns have a default fallback index if not mapped
  ASSET_COLUMNS.forEach((col, idx) => {
    if (assetIndices[col.key] === undefined) {
      assetIndices[col.key] = 4 + idx;
    }
  });

  const parsedRecords = [];
  const accumulatedRecords = [...existingRecords];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (row.length === 0 || row.every(cell => !cell)) continue;

    let entity = (row[columnIndices.entity] || '').trim();
    let location = (row[columnIndices.location] || '').trim();
    let userName = (row[columnIndices.userName] || '').trim();
    let tagNo = (row[columnIndices.tagNo] || '').trim();

    // If tagNo is missing, auto-generate it
    if (!tagNo && (entity || location)) {
      tagNo = generateTagNo(entity, location, accumulatedRecords);
    }

    const assets = {};
    ASSET_COLUMNS.forEach(col => {
      const colIdx = assetIndices[col.key];
      const cellVal = colIdx !== undefined ? row[colIdx] : '';
      assets[col.key] = isValueTruthy(cellVal, col.label);
    });

    const newRec = {
      id: `import-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      tagNo: tagNo || `ASSET/${Date.now().toString().slice(-4)}`,
      entity: entity || 'CORP',
      location: location || 'MAIN',
      userName: userName || 'Unassigned',
      assets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    accumulatedRecords.push(newRec);
    parsedRecords.push(newRec);
  }

  return {
    success: true,
    count: parsedRecords.length,
    records: parsedRecords
  };
}
