import React from 'react';
import { 
  Server, 
  Layers, 
  MapPin, 
  Building2, 
  CheckCircle,
  Laptop,
  Monitor
} from 'lucide-react';
import { ASSET_COLUMNS } from '../constants/assets';

export function MetricsOverview({ records, onSelectAssetFilter, selectedAssetFilter }) {
  // Aggregate metrics
  const totalTags = records.length;
  
  let totalActiveDevices = 0;
  const assetCounts = {};
  ASSET_COLUMNS.forEach(col => {
    assetCounts[col.key] = 0;
  });

  const uniqueEntities = new Set();
  const uniqueLocations = new Set();

  records.forEach(rec => {
    if (rec.entity) uniqueEntities.add(rec.entity.toUpperCase());
    if (rec.location) uniqueLocations.add(rec.location.toUpperCase());

    ASSET_COLUMNS.forEach(col => {
      if (rec.assets?.[col.key]) {
        totalActiveDevices++;
        assetCounts[col.key] = (assetCounts[col.key] || 0) + 1;
      }
    });
  });

  // Find top 3 allocated devices
  const sortedAssets = [...ASSET_COLUMNS]
    .map(col => ({ ...col, count: assetCounts[col.key] || 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <div className="glass-panel metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Allocated Tag Numbers</span>
          <div className="metric-icon-wrap" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
            <Layers size={18} />
          </div>
        </div>
        <div className="metric-value">{totalTags}</div>
        <div className="metric-sub">
          <CheckCircle size={13} style={{ color: '#059669' }} />
          <span>Active allocations across entities</span>
        </div>
      </div>

      <div className="glass-panel metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Total Hardware Deployed</span>
          <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
            <Server size={18} />
          </div>
        </div>
        <div className="metric-value">{totalActiveDevices}</div>
        <div className="metric-sub">
          <span>Spread across 14 asset classes</span>
        </div>
      </div>

      <div className="glass-panel metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Entities & Locations</span>
          <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' }}>
            <Building2 size={18} />
          </div>
        </div>
        <div className="metric-value">
          {uniqueEntities.size} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Entities</span> / {uniqueLocations.size} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Sites</span>
        </div>
        <div className="metric-sub">
          <MapPin size={13} style={{ color: '#6366f1' }} />
          <span>Automatic hierarchical numbering</span>
        </div>
      </div>

      <div className="glass-panel metric-card">
        <div className="metric-card-header">
          <span className="metric-label">Top Allocated Devices</span>
          <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
            <Monitor size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
          {sortedAssets.slice(0, 4).map(item => (
            <button
              key={item.key}
              onClick={() => onSelectAssetFilter(selectedAssetFilter === item.key ? '' : item.key)}
              style={{
                background: selectedAssetFilter === item.key ? '#e0f2fe' : '#f1f5f9',
                border: selectedAssetFilter === item.key ? '1px solid #0284c7' : '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                color: selectedAssetFilter === item.key ? '#0369a1' : '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600
              }}
              title={`Click to filter by ${item.label}`}
            >
              <span>{item.label}</span>
              <strong style={{ color: selectedAssetFilter === item.key ? '#0284c7' : '#0f172a' }}>{item.count}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
