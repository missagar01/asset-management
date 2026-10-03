import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Lock, 
  Unlock, 
  Check, 
  CheckSquare, 
  Square, 
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
  Server,
  User,
  Building,
  MapPin,
  Tag
} from 'lucide-react';
import { 
  ASSET_COLUMNS, 
  ASSET_PRESETS 
} from '../constants/assets';
import { generateTagNo, validateTagNo, cleanCodePart } from '../utils/tagGenerator';

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

export function AssetFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editRecord, 
  existingRecords,
  availableEntities = []
}) {
  const [entity, setEntity] = useState('');
  const [location, setLocation] = useState('');
  const [userName, setUserName] = useState('');
  const [tagNo, setTagNo] = useState('');
  const [isAutoTag, setIsAutoTag] = useState(true);
  const [assets, setAssets] = useState({});
  const [error, setError] = useState('');

  // Effective entity list (Masters sheet entities)
  const entityOptions = availableEntities.length > 0 ? availableEntities : [];

  // Initialize or populate form
  useEffect(() => {
    if (editRecord) {
      setEntity(editRecord.entity || '');
      setLocation(editRecord.location || '');
      setUserName(editRecord.userName || '');
      setTagNo(editRecord.tagNo || '');
      setIsAutoTag(false); // keep manual/existing tag when editing by default
      setAssets(editRecord.assets || {});
    } else {
      // Default new record with first Masters entity if available
      const defaultEntity = entityOptions[0] || '';
      setEntity(defaultEntity);
      setLocation('');
      setUserName('');
      setIsAutoTag(true);
      
      const initialAssets = {};
      ASSET_COLUMNS.forEach(col => {
        initialAssets[col.key] = false;
      });
      // Clean start with all checkboxes unchecked
      setAssets(initialAssets);

      const generated = generateTagNo(defaultEntity, '', existingRecords);
      setTagNo(generated);
    }
    setError('');
  }, [editRecord, isOpen, availableEntities]);

  // Recalculate Tag No when Entity or Location changes if isAutoTag is true
  useEffect(() => {
    if (isAutoTag && entity && location) {
      const generated = generateTagNo(
        entity, 
        location, 
        existingRecords, 
        editRecord ? editRecord.id : null
      );
      setTagNo(generated);
    }
  }, [entity, location, isAutoTag, existingRecords, editRecord]);

  if (!isOpen) return null;

  const handleToggleAsset = (key) => {
    setAssets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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


  const handleToggleAutoTag = () => {
    const nextState = !isAutoTag;
    setIsAutoTag(nextState);
    if (nextState && entity && location) {
      const regenerated = generateTagNo(
        entity, 
        location, 
        existingRecords, 
        editRecord ? editRecord.id : null
      );
      setTagNo(regenerated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!entity.trim()) {
      setError('Please select or enter an Entity.');
      return;
    }
    if (!location.trim()) {
      setError('Please provide a Location.');
      return;
    }
    if (!userName.trim()) {
      setError('Please enter User Name / Assignee.');
      return;
    }
    if (!tagNo.trim()) {
      setError('Tag No cannot be blank.');
      return;
    }

    const validation = validateTagNo(tagNo);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    const recordData = {
      id: editRecord ? editRecord.id : `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tagNo: tagNo.trim().toUpperCase(),
      entity: cleanCodePart(entity),
      location: cleanCodePart(location),
      userName: userName.trim(),
      assets: { ...assets },
      updatedAt: new Date().toISOString(),
      createdAt: editRecord ? editRecord.createdAt : new Date().toISOString()
    };

    onSave(recordData);
    onClose();
  };

  const selectedCount = Object.values(assets).filter(Boolean).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title">
            <Tag size={20} style={{ color: '#38bdf8' }} />
            <span>{editRecord ? 'Edit Asset Assignment' : 'Register New Asset Tag'}</span>
          </div>
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#fca5a5',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem'
              }}>
                {error}
              </div>
            )}

            {/* Tag No Auto-Generator Banner */}
            <div className="tag-preview-box">
              <div>
                <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                  Generated Tag No (Entity / Location / 000n)
                </div>
                <div className="tag-preview-value">
                  {tagNo || `${cleanCodePart(entity) || 'ENTITY'}/${cleanCodePart(location) || 'LOC'}/0001`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleToggleAutoTag}
                  title={isAutoTag ? 'Auto generation enabled. Click to manual edit.' : 'Manual edit mode. Click to re-sync auto generation.'}
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
            </div>

            {/* Custom Tag No input if manual mode */}
            {!isAutoTag && (
              <div className="form-group">
                <label className="form-label" htmlFor="custom-tag-no">
                  <span>Custom Tag No (Must follow Entity/Location/000n)</span>
                </label>
                <input
                  id="custom-tag-no"
                  type="text"
                  className="form-input font-mono"
                  value={tagNo}
                  onChange={e => setTagNo(e.target.value)}
                  placeholder="e.g. ENTITY/LOCATION/0001"
                />
              </div>
            )}

            {/* Entity and Location Grid */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="input-entity">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building size={14} className="text-slate-500" /> Entity / Department
                  </span>
                </label>
                
                {availableEntities.length > 0 ? (
                  <select
                    id="input-entity"
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
                    id="input-entity"
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
                <label className="form-label" htmlFor="input-location">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} className="text-slate-500" /> Location / Branch / Floor
                  </span>
                </label>
                <input
                  id="input-location"
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
              <label className="form-label" htmlFor="input-username">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} /> User Name / Assignee / Workstation
                </span>
              </label>
              <input
                id="input-username"
                type="text"
                className="form-input"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Enter user or custodian name"
                required
              />
            </div>

            {/* 14 Asset Checkboxes Section */}
            <div>
              <div className="assets-section-header">
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    Assign Hardware Assets ({selectedCount}/14 Selected)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Hardware classification (Asset1 through Asset14)
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
              <div className="asset-checkbox-grid">
                {ASSET_COLUMNS.map(col => {
                  const isChecked = Boolean(assets[col.key]);
                  const IconComponent = ICON_MAP[col.icon] || Box;

                  return (
                    <div
                      key={col.key}
                      id={`checkbox-${col.key}`}
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
                        <span className="asset-card-sub">{col.key}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              id="btn-save-asset"
              type="submit" 
              className="btn btn-primary"
            >
              <Check size={16} />
              <span>{editRecord ? 'Update Asset' : 'Generate & Save Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
