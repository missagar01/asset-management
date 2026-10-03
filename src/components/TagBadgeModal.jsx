import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Tag, ShieldCheck, QrCode as QrIcon, Check, Copy, Maximize2, Minimize2, Download } from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { ASSET_COLUMNS } from '../constants/assets';

export function TagBadgeModal({ isOpen, onClose, record }) {
  const [qrSvg, setQrSvg] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrFormat, setQrFormat] = useState('multiline'); // 'multiline' | 'singleline' | 'tagOnly'
  const [copied, setCopied] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const barcodeRef = useRef(null);

  // Extract allocated hardware list safely
  const allocatedAssets = record && record.assets
    ? ASSET_COLUMNS.filter(col => {
        const val = record.assets[col.key];
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.trim().length > 0 && val.toUpperCase() !== 'FALSE' && val !== '0';
        return Boolean(val);
      })
    : [];

  const hardwareNames = allocatedAssets.length > 0 
    ? allocatedAssets.map(c => c.label).join(', ') 
    : 'None';

  // Construct QR Payload with all details
  const getQrPayload = () => {
    if (!record) return '';

    if (qrFormat === 'tagOnly') {
      return String(record.tagNo || '').trim();
    }

    if (qrFormat === 'singleline') {
      return `Tag No: ${record.tagNo || '—'} | Entity: ${record.entity || '—'} | Location: ${record.location || '—'} | Custodian: ${record.userName || '—'} | Hardware: ${hardwareNames}`;
    }

    // Default: Multi-line Full Details (Tag, Entity, Location, Custodian, Hardware)
    return [
      `Tag No: ${record.tagNo || '—'}`,
      `Entity: ${record.entity || '—'}`,
      `Location: ${record.location || '—'}`,
      `Custodian: ${record.userName || '—'}`,
      `Hardware: ${hardwareNames}`
    ].join('\n');
  };

  const currentPayload = getQrPayload();

  // Generate crisp vector SVG and high-res data URL
  useEffect(() => {
    if (!record || !currentPayload) return;

    // 1. Crisp Vector SVG (Zero blur, perfect for Google Lens & high-DPI screens)
    QRCode.toString(currentPayload, {
      type: 'svg',
      margin: 4,
      errorCorrectionLevel: 'L' // Low error correction = fewer & larger modules (easier to scan!)
    })
      .then(svg => {
        setQrSvg(svg);
      })
      .catch(err => {
        console.error('Failed to generate QR SVG:', err);
      });

    // 2. High-Res PNG Data URL (600px source for downloads and printing)
    QRCode.toDataURL(currentPayload, {
      width: 600,
      margin: 4,
      errorCorrectionLevel: 'L',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR Data URL:', err);
      });
  }, [record, currentPayload]);

  // Generate standard 1D Code128 Barcode for Tag No
  useEffect(() => {
    if (!record || !barcodeRef.current) return;

    try {
      const cleanTag = String(record.tagNo || 'ASSET-TAG').trim();
      JsBarcode(barcodeRef.current, cleanTag, {
        format: 'CODE128',
        width: 1.4,
        height: 32,
        displayValue: true,
        fontSize: 10,
        font: 'monospace',
        textMargin: 2,
        margin: 2,
        background: '#ffffff',
        lineColor: '#000000'
      });
    } catch (err) {
      console.warn('JsBarcode render fallback:', err);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    if (!currentPayload) return;
    navigator.clipboard.writeText(currentPayload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${(record.tagNo || 'asset').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '640px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Tag size={20} style={{ color: '#0284c7' }} />
            <span>Asset Tag Badge Preview</span>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              marginLeft: '0.5rem'
            }}>
              Half A5 (148 × 105 mm)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setIsZoomModalOpen(!isZoomModalOpen)}
              title="Toggle Large QR Code View for Google Lens & Scanner"
              style={{
                fontSize: '0.75rem',
                color: isZoomModalOpen ? '#0284c7' : '#475569',
                borderColor: isZoomModalOpen ? '#0284c7' : '#cbd5e1'
              }}
            >
              {isZoomModalOpen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isZoomModalOpen ? 'Show Badge Card' : 'Enlarge for Google Lens'}</span>
            </button>
            <button type="button" className="btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* QR Scanner Content Selector */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.6rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
            QR Code Data Format:
          </span>
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setQrFormat('multiline')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                background: qrFormat === 'multiline' ? '#ffffff' : 'transparent',
                color: qrFormat === 'multiline' ? '#0284c7' : '#64748b',
                boxShadow: qrFormat === 'multiline' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
              title="Encodes all details (Tag, Entity, Location, Custodian, Hardware) on separate lines"
            >
              Full Details (Multiline)
            </button>
            <button
              type="button"
              onClick={() => setQrFormat('singleline')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                background: qrFormat === 'singleline' ? '#ffffff' : 'transparent',
                color: qrFormat === 'singleline' ? '#0284c7' : '#64748b',
                boxShadow: qrFormat === 'singleline' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
              title="Encodes all details separated by | on a single line"
            >
              Single-Line Details
            </button>
            <button
              type="button"
              onClick={() => setQrFormat('tagOnly')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                background: qrFormat === 'tagOnly' ? '#ffffff' : 'transparent',
                color: qrFormat === 'tagOnly' ? '#0284c7' : '#64748b',
                boxShadow: qrFormat === 'tagOnly' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
              title="Encodes only Tag Number (e.g. SRMPL/FIRST-FLOOR-HALL/0001)"
            >
              Tag No Only
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#f1f5f9', padding: '1.25rem' }}>
          {isZoomModalOpen ? (
            /* ENLARGED QR CODE VIEW FOR INSTANT GOOGLE LENS & SCREEN SCANNING */
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.75rem',
              textAlign: 'center',
              border: '2px solid #0f172a',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <QrIcon size={18} />
                <span>Google Lens & Screen Scanner View</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 auto 1.25rem auto', maxWidth: '380px' }}>
                Right-click and select <strong>Search image with Google</strong> or point your phone camera at the QR code below.
              </p>

              {/* Large Crisp Vector SVG (260px x 260px - 100% Zero Blur) */}
              <div style={{
                width: '260px',
                height: '260px',
                margin: '0 auto 1.25rem auto',
                padding: '12px',
                background: '#ffffff',
                border: '2px solid #0f172a',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                {qrSvg ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: qrSvg }} 
                    style={{ width: '100%', height: '100%' }} 
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Generating QR...
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadQr}
                >
                  <Download size={15} />
                  <span>Download High-Res QR (PNG)</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsZoomModalOpen(false)}
                >
                  <span>Back to Badge Card</span>
                </button>
              </div>
            </div>
          ) : (
            /* PRINTABLE PHYSICAL BADGE CARD (Half A5: 148mm x 105mm) */
            <div className="tag-print-card" id="printable-asset-tag">
              {/* Header */}
              <div className="tag-print-header">
                <div>
                  <div className="tag-print-company">ENTERPRISE ASSET TAG</div>
                  <div style={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    IT Infrastructure & Asset Register
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7' }}>
                  <ShieldCheck size={22} />
                </div>
              </div>

              {/* Official Tag Identifier Banner */}
              <div className="tag-print-tagno-banner">
                <div style={{ fontSize: '0.5625rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em' }}>
                  OFFICIAL ASSET IDENTIFIER
                </div>
                <div className="tag-print-tagno">
                  {record.tagNo}
                </div>
              </div>

              {/* Entity, Location, Custodian Details */}
              <div className="tag-print-grid">
                <div>
                  <div className="tag-print-label">Entity</div>
                  <div className="tag-print-val">{record.entity || '—'}</div>
                </div>
                <div>
                  <div className="tag-print-label">Location</div>
                  <div className="tag-print-val">{record.location || '—'}</div>
                </div>
                <div>
                  <div className="tag-print-label">Assigned Custodian</div>
                  <div className="tag-print-val">{record.userName || '—'}</div>
                </div>
              </div>

              {/* Checklist of 14 Hardware Assets (4 Columns for Compact Half A5 Fit) */}
              <div className="tag-print-assets">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <div className="tag-print-label" style={{ marginBottom: 0 }}>
                    Allocated Hardware Checklist (14 Classes)
                  </div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#0284c7' }}>
                    {allocatedAssets.length} / 14 Allocated
                  </div>
                </div>

                <div className="tag-print-checklist">
                  {ASSET_COLUMNS.map(col => {
                    const isAllocated = Boolean(record.assets?.[col.key]);
                    return (
                      <div 
                        key={col.key} 
                        className={`tag-print-checkitem ${isAllocated ? 'is-allocated' : ''}`}
                      >
                        <span className={`tag-print-box ${isAllocated ? 'checked' : ''}`}>
                          {isAllocated ? '✓' : ''}
                        </span>
                        <span className="tag-print-item-name">{col.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer with 1D Code128 Barcode and 2D Scannable QR Code */}
              <div className="tag-print-footer">
                {/* Real 1D Code128 Barcode (Scannable for Tag Number) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <svg ref={barcodeRef} style={{ maxWidth: '185px', height: '38px', display: 'block' }}></svg>
                  <div style={{ fontSize: '0.5rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1D Barcode (Tag No)
                  </div>
                </div>

                {/* Real 2D QR Code with All Asset Details (Crisp Vector SVG) */}
                <div className="tag-print-qr-wrap">
                  {qrSvg ? (
                    <div 
                      className="tag-print-qr-svg-wrap" 
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                      title="Click to Enlarge QR Code for Google Lens / Mobile Scanner"
                      onClick={() => setIsZoomModalOpen(true)}
                    />
                  ) : (
                    <div style={{
                      width: '96px',
                      height: '96px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#ffffff',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      color: '#64748b'
                    }}>
                      Generating...
                    </div>
                  )}
                  <div 
                    className="tag-print-qr-sub"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setIsZoomModalOpen(true)}
                  >
                    Click to Enlarge
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Output Live Preview Box (Non-Printing) */}
          <div style={{
            marginTop: '1rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.35rem'
            }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                Scanned QR Code Content ({qrFormat === 'multiline' ? 'Full Multiline' : (qrFormat === 'singleline' ? 'Single Line' : 'Tag Only')}):
              </span>
              <button
                type="button"
                onClick={handleCopyPayload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.6875rem',
                  color: copied ? '#059669' : '#0284c7',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <pre style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#0f172a',
              background: '#f8fafc',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: 1.45
            }}>
              {currentPayload}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Includes: <strong>Tag, Entity, Location, Custodian & Hardware</strong> • Size: <strong>Half A5</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print Half A5 Tag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
