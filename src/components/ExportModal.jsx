import React, { useState, useMemo } from 'react';
import { X, Download, Copy, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { generateSheetCsv, generateSheetTsv, downloadCsvFile } from '../utils/sheetConverter';
import { SHEET1_HEADERS } from '../constants/assets';

export function ExportModal({ isOpen, onClose, records }) {
  const [format, setFormat] = useState('LABEL');
  const [copied, setCopied] = useState(false);

  // Generate preview of CSV
  const previewText = useMemo(() => {
    return generateSheetCsv(records.slice(0, 4), format);
  }, [records, format]);

  if (!isOpen) return null;

  const handleCopyTsv = () => {
    const tsv = generateSheetTsv(records, format);
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadCsvFile(records, 'Asset_Registry.csv', format);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Download size={20} style={{ color: '#38bdf8' }} />
            <span>Export Asset Records</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            fontSize: '0.8125rem',
            color: '#065f46'
          }}>
            All exported data follows the standardized 19-column asset registry schema:
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginTop: '0.35rem', color: '#047857', fontWeight: 600 }}>
              [Tag No, Entity, Location, User Name, System IP, Asset1..Asset14]
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Select Value Format for Asset Checkboxes</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {[
                { id: 'LABEL', title: 'Asset Name (Default)', desc: 'Stores MONITER or blank' },
                { id: 'TRUE_FALSE', title: 'TRUE / FALSE', desc: 'Standard Boolean format' },
                { id: 'YES_NO', title: 'YES / NO', desc: 'Text format' },
                { id: '1_0', title: '1 / 0', desc: 'Numeric binary' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  style={{
                    background: format === opt.id ? '#f0f9ff' : '#ffffff',
                    border: format === opt.id ? '1.5px solid #0284c7' : '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '0.625rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: format === opt.id ? '#0284c7' : '#0f172a' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Box */}
          <div className="form-group">
            <label className="form-label">
              <span>Live Output Preview (First {Math.min(records.length, 3)} rows)</span>
            </label>
            <pre style={{
              background: '#f8fafc',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#334155',
              overflowX: 'auto',
              maxHeight: '140px',
              lineHeight: '1.4'
            }}>
              {previewText}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          <button 
            type="button" 
            className="btn btn-outline-emerald"
            onClick={handleCopyTsv}
          >
            {copied ? (
              <>
                <CheckCircle2 size={16} />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                <span>Copy TSV to Clipboard</span>
              </>
            )}
          </button>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleDownload}
          >
            <Download size={16} />
            <span>Download CSV ({records.length} records)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
