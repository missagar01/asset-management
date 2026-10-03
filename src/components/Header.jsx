import React from 'react';
import { 
  Layers, 
  PlusCircle, 
  Upload, 
  Download, 
  Copy, 
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  User,
  Globe,
  RefreshCw
} from 'lucide-react';
import { isDeployedUrlConfigured } from '../services/googleSheetService';

export function Header({ 
  currentUser,
  onLogout,
  onAddNew, 
  onOpenImport, 
  onOpenExport, 
  onQuickCopySheet, 
  onResetData, 
  onSyncFromSheet,
  isSyncingSheet,
  totalRecords,
  copiedFeedback 
}) {
  const isSheetConnected = isDeployedUrlConfigured();

  return (
    <header className="header">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Layers size={26} />
        </div>
        <div className="brand-info">
          <h1>
            AssetPulse
            <span className="brand-tag">Enterprise</span>
          </h1>
          <p className="brand-subtitle">
            Enterprise Asset Management • Auto Tag No (Entity/Location/000n) • 14 Hardware Assets
          </p>
        </div>
      </div>

      <div className="header-actions">
        {isSheetConnected && (
          <button
            id="btn-sync-cloud-data"
            className="btn btn-sm btn-outline-emerald"
            onClick={onSyncFromSheet}
            disabled={isSyncingSheet}
            title="Synchronize records with cloud storage"
            style={{ fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} className={isSyncingSheet ? 'spin-animation' : ''} />
            <span>{isSyncingSheet ? 'Syncing...' : 'Sync Cloud Data'}</span>
          </button>
        )}

        <button 
          id="btn-add-new-asset"
          className="btn btn-primary" 
          onClick={onAddNew}
          title="Create a new asset assignment"
        >
          <PlusCircle size={17} />
          <span>New Asset Tag</span>
        </button>

        <button 
          id="btn-import-records"
          className="btn btn-secondary" 
          onClick={onOpenImport}
          title="Import asset records from CSV or TSV"
        >
          <Upload size={16} />
          <span>Import Records</span>
        </button>

        <button 
          id="btn-quick-copy-table"
          className="btn btn-secondary" 
          onClick={onQuickCopySheet}
          title="Copy formatted table rows to clipboard"
        >
          {copiedFeedback ? (
            <>
              <CheckCircle2 size={16} style={{ color: '#34d399' }} />
              <span style={{ color: '#34d399' }}>Copied Table!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy Table</span>
            </>
          )}
        </button>

        <button 
          id="btn-export-csv"
          className="btn btn-secondary" 
          onClick={onOpenExport}
          title="Export CSV dataset"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>

        <button 
          id="btn-reset-demo"
          className="btn btn-icon" 
          onClick={onResetData}
          title="Reset to sample demo assets"
        >
          <RotateCcw size={16} />
        </button>

        {/* User Profile Pill & Sign Out */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingLeft: '0.5rem',
            borderLeft: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem'
            }}>
              {currentUser.role === 'ADMIN' ? (
                <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
              ) : (
                <User size={14} style={{ color: '#34d399' }} />
              )}
              <strong style={{ color: '#f8fafc' }}>{currentUser.username}</strong>
            </div>

            <button
              id="btn-header-logout"
              className="btn btn-icon"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
