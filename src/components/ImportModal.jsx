import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { parseGoogleSheetText } from '../utils/sheetConverter';
import { SHEET1_HEADERS, ASSET_COLUMNS } from '../constants/assets';

export function ImportModal({ isOpen, onClose, onImport, existingRecords }) {
  const [inputText, setInputText] = useState('');
  const [importMode, setImportMode] = useState('append'); // 'append' or 'replace'
  const [previewResult, setPreviewResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTextChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setErrorMsg('');

    if (text.trim().length > 0) {
      const parsed = parseGoogleSheetText(text, existingRecords);
      if (parsed.success && parsed.records.length > 0) {
        setPreviewResult(parsed);
      } else {
        setPreviewResult(null);
        if (parsed.error) setErrorMsg(parsed.error);
      }
    } else {
      setPreviewResult(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
        const parsed = parseGoogleSheetText(content, existingRecords);
        if (parsed.success && parsed.records.length > 0) {
          setPreviewResult(parsed);
          setErrorMsg('');
        } else {
          setPreviewResult(null);
          setErrorMsg(parsed.error || 'No valid rows found in file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!previewResult || previewResult.records.length === 0) {
      setErrorMsg('No valid records to import.');
      return;
    }

    onImport(previewResult.records, importMode);
    onClose();
  };

  const samplePasteSnippet = 
`Tag No\tEntity\tLocation\tUser Name\tAsset1\tAsset2\tAsset3\tAsset4\tAsset5\tAsset6\tAsset7\tAsset8\tAsset9\tAsset10\tAsset11\tAsset12\tAsset13\tAsset14
CORP/MUMBAI-HQ/0007\tCORP\tMUMBAI-HQ\tDevendra Sen\tTRUE\tTRUE\tFALSE\tTRUE\tTRUE\tTRUE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '820px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <Upload size={20} style={{ color: '#38bdf8' }} />
            <span>Import Asset Records</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            fontSize: '0.8125rem',
            color: '#0369a1'
          }}>
            <strong>Instructions:</strong> Copy rows from your spreadsheet or data table (Ctrl+C), and paste directly into the box below, or upload a <code>.csv</code> file. All 18 standard columns will be mapped automatically.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Paste TSV / CSV Data or Upload
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleTextChange({ target: { value: samplePasteSnippet } })}
              >
                Insert Sample Row
              </button>
              <label 
                className="btn btn-sm btn-secondary" 
                style={{ cursor: 'pointer', margin: 0 }}
              >
                <FileText size={14} />
                <span>Upload CSV</span>
                <input 
                  type="file" 
                  accept=".csv,.tsv,.txt" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <textarea
            className="form-input font-mono"
            style={{ 
              height: '140px', 
              resize: 'vertical', 
              fontSize: '0.75rem', 
              lineHeight: '1.4' 
            }}
            value={inputText}
            onChange={handleTextChange}
            placeholder={`Paste data (TSV / CSV) here...\n(Columns: Tag No, Entity, Location, User Name, Asset1..Asset14)`}
          />

          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#e11d48',
              padding: '0.625rem 0.875rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Section */}
          {previewResult && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.875rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>Successfully recognized {previewResult.records.length} asset records!</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#64748b' }}>Mode:</span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#1e293b' }}>
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                    />
                    <span>Append</span>
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#1e293b' }}>
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                    />
                    <span>Replace All</span>
                  </label>
                </div>
              </div>

              {/* Mini preview table */}
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                background: '#ffffff'
              }}>
                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Tag No</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>User Name</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Entity</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Location</th>
                      <th style={{ padding: '0.4rem 0.6rem' }}>Assets Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewResult.records.slice(0, 10).map((r, idx) => {
                      const count = Object.values(r.assets || {}).filter(Boolean).length;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 600 }}>{r.tagNo}</td>
                          <td style={{ padding: '0.4rem 0.6rem', color: '#0f172a' }}>{r.userName}</td>
                          <td style={{ padding: '0.4rem 0.6rem', color: '#475569' }}>{r.entity}</td>
                          <td style={{ padding: '0.4rem 0.6rem', color: '#475569' }}>{r.location}</td>
                          <td style={{ padding: '0.4rem 0.6rem', color: '#059669', fontWeight: 600 }}>{count} devices active</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {previewResult.records.length > 10 && (
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'right' }}>
                  + {previewResult.records.length - 10} more rows
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleConfirmImport}
            disabled={!previewResult || previewResult.records.length === 0}
          >
            <span>Confirm & Import ({previewResult ? previewResult.records.length : 0})</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
