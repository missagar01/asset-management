import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Layers, 
  Tag, 
  Building, 
  MapPin, 
  User, 
  Check, 
  Send, 
  Lock, 
  Unlock, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  RotateCcw,
  Monitor, 
  Cpu, 
  HardDrive, 
  Keyboard, 
  Mouse, 
  BatteryCharging, 
  PhoneCall, 
  FileText, 
  Laptop, 
  Tablet, 
  Tv, 
  Server,
  Box,
  CloudCheck
} from 'lucide-react';
import { 
  ASSET_COLUMNS, 
  ASSET_PRESETS 
} from '../constants/assets';
import { generateTagNo, validateTagNo, cleanCodePart } from '../utils/tagGenerator';
import { postAssetToGoogleSheet, isDeployedUrlConfigured } from '../services/googleSheetService';
import { TagBadgeModal } from './TagBadgeModal';

// Icon map for the 14 assets
const ICON_MAP = {
  Monitor,
  Cpu,
  HardDrive,
  Keyboard,
  Mouse,
  BatteryCharging,
  PhoneCall,
  Printer,
  Box,
  FileText,
  Laptop,
  Tablet,
  Tv,
  Server
};

export function UserPortal({ 
  currentUser, 
  onLogout, 
  onSaveRecord, 
  existingRecords,
  availableEntities = [],
  permittedTabs = [],
  currentRoute = 'form',
  onNavigateTab
}) {
  const entityOptions = availableEntities.length > 0 ? availableEntities : [];
  const initialEntity = currentUser?.entity || entityOptions[0] || '';

  const [entity, setEntity] = useState(initialEntity);
  const [location, setLocation] = useState('');
  const [userName, setUserName] = useState(currentUser?.displayName || currentUser?.username || '');
  const [tagNo, setTagNo] = useState('');
  const [isAutoTag, setIsAutoTag] = useState(true);
  const [assets, setAssets] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Submission success state
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [cloudStatus, setCloudStatus] = useState('');
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Initialize checkboxes
  useEffect(() => {
    resetForm();
  }, [currentUser, availableEntities]);

  // Auto-generate Tag No when Entity or Location changes
  useEffect(() => {
    if (isAutoTag) {
      if (entity && location) {
        const generated = generateTagNo(entity, location, existingRecords);
        setTagNo(generated);
      } else {
        setTagNo('');
      }
    }
  }, [entity, location, isAutoTag, existingRecords]);

  const resetForm = () => {
    const defEnt = currentUser?.entity || entityOptions[0] || '';
    setEntity(defEnt);
    setLocation('');
    setUserName(currentUser?.displayName || currentUser?.username || '');
    setIsAutoTag(true);
    setError('');
    setSubmittedRecord(null);
    setCloudStatus('');

    const initial = {};
    ASSET_COLUMNS.forEach(col => {
      initial[col.key] = false;
    });
    // Clean start with all checkboxes unchecked
    setAssets(initial);

    const gen = (defEnt && location) ? generateTagNo(defEnt, location, existingRecords) : '';
    setTagNo(gen);
  };

  const handleToggleAsset = (key) => {
    setAssets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyPreset = (preset) => {
    const updated = {};
    ASSET_COLUMNS.forEach(col => {
      updated[col.key] = preset.assets.includes(col.key);
    });
    setAssets(updated);
  };

  const handleSelectAll = (selectVal) => {
    const updated = {};
    ASSET_COLUMNS.forEach(col => {
      updated[col.key] = selectVal;
    });
    setAssets(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!entity.trim()) {
      setError('Please specify Entity / Department.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify Location.');
      return;
    }
    if (!userName.trim()) {
      setError('Please enter User Name / Assignee.');
      return;
    }

    const validation = validateTagNo(tagNo);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsSubmitting(true);

    const recordData = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tagNo: tagNo.trim().toUpperCase(),
      entity: cleanCodePart(entity),
      location: cleanCodePart(location),
      userName: userName.trim(),
      assets: { ...assets },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Save to local repository
    onSaveRecord(recordData);

    // 2. Post to cloud endpoint if configured
    if (isDeployedUrlConfigured()) {
      setCloudStatus('Synchronizing with central database...');
      try {
        const cloudRes = await postAssetToGoogleSheet(recordData);
        if (cloudRes.success) {
          setCloudStatus('Synchronized directly with central database!');
        } else {
          setCloudStatus('Saved locally to registry');
        }
      } catch (err) {
        setCloudStatus('Saved locally to registry');
      }
    } else {
      setCloudStatus('Saved to asset register');
    }

    setIsSubmitting(false);
    setSubmittedRecord(recordData);
  };

  const selectedCount = Object.values(assets).filter(Boolean).length;
  const isSheetConfigured = isDeployedUrlConfigured();

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* SUCCESS CONFIRMATION SCREEN */}
      {submittedRecord ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Asset Successfully Registered!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
            Your hardware equipment allocation has been registered with auto-generated Tag No.
          </p>

          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '1rem 2rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Official Tag Number
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#0284c7',
              letterSpacing: '0.05em',
              margin: '0.25rem 0'
            }}>
              {submittedRecord.tagNo}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
              Assigned to: <strong>{submittedRecord.userName}</strong> • {submittedRecord.entity} / {submittedRecord.location}
            </div>
          </div>

          {cloudStatus && (
            <div style={{
              fontSize: '0.75rem',
              color: cloudStatus.includes('failed') ? '#e11d48' : '#059669',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontWeight: 600
            }}>
              <Check size={14} />
              <span>{cloudStatus}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowBadgeModal(true)}
            >
              <Printer size={16} />
              <span>View & Print Asset Tag</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={resetForm}
            >
              <RotateCcw size={16} />
              <span>Submit Another Asset</span>
            </button>
          </div>
        </div>
      ) : (
        /* ASSET SUBMISSION FORM */
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              Hardware Asset Registration
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Fill in your details and select the assigned equipment. Tag No will generate automatically.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tag No Auto-Preview Banner */}
            <div className="tag-preview-box">
              <div>
                <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Automatic Tag Identifier (Entity/Location/000n)
                </div>
                <div className="tag-preview-value">
                  {tagNo || `${cleanCodePart(entity) || 'ENTITY'}/${cleanCodePart(location) || 'LOC'}/0001`}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setIsAutoTag(!isAutoTag)}
                title={isAutoTag ? 'Auto generation enabled' : 'Manual edit mode'}
              >
                {isAutoTag ? (
                  <>
                    <Lock size={13} style={{ color: '#0284c7' }} />
                    <span style={{ color: '#0284c7' }}>Auto Lock</span>
                  </>
                ) : (
                  <>
                    <Unlock size={13} style={{ color: '#d97706' }} />
                    <span style={{ color: '#d97706' }}>Manual Edit</span>
                  </>
                )}
              </button>
            </div>

            {!isAutoTag && (
              <div className="form-group">
                <label className="form-label" htmlFor="user-custom-tag">
                  <span>Custom Tag No (Must follow Entity/Location/000n)</span>
                </label>
                <input
                  id="user-custom-tag"
                  type="text"
                  className="form-input font-mono"
                  value={tagNo}
                  onChange={e => setTagNo(e.target.value)}
                  placeholder="e.g. ENTITY/LOCATION/0001"
                />
              </div>
            )}

            {/* Entity and Location */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="user-input-entity">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building size={14} className="text-slate-500" /> Entity / Department
                  </span>
                </label>

                {availableEntities.length > 0 ? (
                  <select
                    id="user-input-entity"
                    className="select-custom"
                    style={{ width: '100%' }}
                    value={entity}
                    onChange={e => setEntity(e.target.value)}
                    required
                  >
                    <option value="">-- Select Entity --</option>
                    {availableEntities.map(ent => (
                      <option key={ent} value={ent}>{ent}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="user-input-entity"
                    type="text"
                    className="form-input"
                    value={entity}
                    onChange={e => setEntity(e.target.value)}
                    placeholder="Enter Entity / Department"
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="user-input-location">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} className="text-slate-500" /> Location / Branch / Floor
                  </span>
                </label>
                <input
                  id="user-input-location"
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter location / branch / floor"
                  required
                />
              </div>
            </div>

            {/* User Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="user-input-name">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} /> User Name / Custodian / Workstation
                </span>
              </label>
              <input
                id="user-input-name"
                type="text"
                className="form-input"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Enter your full name or desk identifier"
                required
              />
            </div>

            {/* 14 Checkboxes with requested labels */}
            <div>
              <div className="assets-section-header">
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Select Allocated Hardware ({selectedCount}/14 Selected)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Check each piece of equipment assigned to this user
                  </div>
                </div>

                <div className="preset-pills">
                  {ASSET_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className="preset-pill-btn"
                      onClick={() => handleApplyPreset(preset)}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="preset-pill-btn"
                    onClick={() => handleSelectAll(true)}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className="preset-pill-btn"
                    onClick={() => handleSelectAll(false)}
                  >
                    None
                  </button>
                </div>
              </div>

              {/* 14 Checkbox Cards Grid */}
              <div className="asset-checkbox-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
                {ASSET_COLUMNS.map(col => {
                  const isChecked = Boolean(assets[col.key]);
                  const IconComponent = ICON_MAP[col.icon] || Box;

                  return (
                    <div
                      key={col.key}
                      id={`user-checkbox-${col.key}`}
                      className={`asset-checkbox-card ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleToggleAsset(col.key)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleToggleAsset(col.key);
                        }
                      }}
                    >
                      <div className="asset-custom-checkbox">
                        {isChecked && <Check size={13} strokeWidth={3} />}
                      </div>

                      <div style={{ color: isChecked ? '#0284c7' : '#64748b' }}>
                        <IconComponent size={18} />
                      </div>

                      <div className="asset-card-label">
                        <span className="asset-name">{col.label}</span>
                        <span className="asset-card-sub">{col.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {isSheetConfigured ? (
                  <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Check size={14} /> Cloud Sync Active
                  </span>
                ) : (
                  <span>Local Registry Enabled</span>
                )}
              </div>

              <button
                id="btn-submit-asset-user"
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
                disabled={isSubmitting}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Registering Asset...' : 'Submit Hardware Asset'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Print Badge Modal for newly submitted item */}
      <TagBadgeModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        record={submittedRecord}
      />
    </div>
  );
}
