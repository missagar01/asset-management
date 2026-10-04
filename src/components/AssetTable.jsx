import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  QrCode, 
  CopyPlus, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  CheckSquare,
  Square,
  Sparkles,
  Laptop,
  Monitor,
  Printer,
  Server,
  LayoutGrid,
  List
} from 'lucide-react';
import { ASSET_COLUMNS } from '../constants/assets';

export function AssetTable({
  records,
  onEdit,
  onDelete,
  onDuplicate,
  onViewTagBadge,
  onDeleteSelected,
  onExportSelected,
  selectedAssetFilter,
  setSelectedAssetFilter,
  isReadOnly = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortField, setSortField] = useState('tagNo');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copiedTagId, setCopiedTagId] = useState(null);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'cards' | 'table'

  // Extract unique entities and locations for filters
  const entities = useMemo(() => {
    const set = new Set();
    records.forEach(r => { if (r.entity) set.add(r.entity); });
    return Array.from(set).sort();
  }, [records]);

  const locations = useMemo(() => {
    const set = new Set();
    records.forEach(r => { if (r.location) set.add(r.location); });
    return Array.from(set).sort();
  }, [records]);

  // Filtering and sorting
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter(rec => {
      // Search match
      if (query) {
        const matchTag = (rec.tagNo || '').toLowerCase().includes(query);
        const matchUser = (rec.userName || '').toLowerCase().includes(query);
        const matchIp = (rec.systemIp || '').toLowerCase().includes(query);
        const matchEntity = (rec.entity || '').toLowerCase().includes(query);
        const matchLoc = (rec.location || '').toLowerCase().includes(query);
        if (!matchTag && !matchUser && !matchIp && !matchEntity && !matchLoc) {
          return false;
        }
      }

      // Entity filter
      if (selectedEntity && rec.entity !== selectedEntity) {
        return false;
      }

      // Location filter
      if (selectedLocation && rec.location !== selectedLocation) {
        return false;
      }

      // Hardware filter (e.g. Asset1..Asset14)
      if (selectedAssetFilter && !rec.assets?.[selectedAssetFilter]) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'assetCount') {
        valA = Object.values(a.assets || {}).filter(Boolean).length;
        valB = Object.values(b.assets || {}).filter(Boolean).length;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      return 0;
    });
  }, [records, searchQuery, selectedEntity, selectedLocation, selectedAssetFilter, sortField, sortDirection]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map(r => r.id)));
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyTag = (e, tagNo, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tagNo);
    setCopiedTagId(id);
    setTimeout(() => setCopiedTagId(null), 1800);
  };

  const isAllSelected = filteredRecords.length > 0 && selectedIds.size === filteredRecords.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Controls / Filter Bar */}
      <div className="control-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            id="search-assets"
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Tag No (e.g. CORP/MUMBAI/0001), User Name, System IP, Entity..."
          />
        </div>

        <div className="filter-group">
          {/* Entity Filter */}
          <select
            id="filter-entity"
            className="select-custom"
            value={selectedEntity}
            onChange={e => setSelectedEntity(e.target.value)}
          >
            <option value="">All Entities ({entities.length})</option>
            {entities.map(ent => (
              <option key={ent} value={ent}>{ent}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            id="filter-location"
            className="select-custom"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations ({locations.length})</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Hardware Device Filter */}
          <select
            id="filter-asset-device"
            className="select-custom"
            value={selectedAssetFilter}
            onChange={e => setSelectedAssetFilter(e.target.value)}
          >
            <option value="">All Devices (14 Assets)</option>
            {ASSET_COLUMNS.map(col => (
              <option key={col.key} value={col.key}>{col.label} ({col.key})</option>
            ))}
          </select>

          {/* Reset Filters button if any filter is active */}
          {(searchQuery || selectedEntity || selectedLocation || selectedAssetFilter) && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedEntity('');
                setSelectedLocation('');
                setSelectedAssetFilter('');
              }}
            >
              Clear Filters
            </button>
          )}

          {/* View Mode Switcher: Auto / Cards / Table */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('auto')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${viewMode === 'auto' ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm' : 'text-slate-400 hover:text-white border border-transparent'}`}
              title="Auto Responsive (Cards on Mobile, Table on Desktop)"
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'cards' ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm' : 'text-slate-400 hover:text-white border border-transparent'}`}
              title="Cards Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm' : 'text-slate-400 hover:text-white border border-transparent'}`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions banner if items are selected */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '0.625rem 1rem',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '0.8125rem', color: '#7dd3fc', fontWeight: 600 }}>
            {selectedIds.size} of {filteredRecords.length} records selected
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => onExportSelected(Array.from(selectedIds))}
            >
              Export Selected CSV
            </button>
            {!isReadOnly && (
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                onClick={() => {
                  if (window.confirm(`Delete ${selectedIds.size} selected records?`)) {
                    onDeleteSelected(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }
                }}
              >
                <Trash2 size={13} />
                <span>Delete Selected</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile & Responsive Cards Grid View */}
      <div className={`${viewMode === 'cards' ? 'block' : (viewMode === 'table' ? 'hidden' : 'block lg:hidden')} mb-6`}>
        {filteredRecords.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-white/10">
            <Search size={36} className="mx-auto mb-3 text-slate-500" />
            <div className="text-sm font-semibold text-slate-300">No asset allocations match your filter criteria</div>
            <div className="text-xs text-slate-500 mt-1">Try clearing your filters or create a new asset tag.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredRecords.map((rec) => {
              const isSelected = selectedIds.has(rec.id);
              const activeAssets = ASSET_COLUMNS.filter(col => rec.assets?.[col.key]);
              const userInitials = (rec.userName || 'U')
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div 
                  key={rec.id}
                  className={`
                    relative rounded-2xl p-4 transition-all duration-200
                    border flex flex-col justify-between
                    ${isSelected 
                      ? 'bg-sky-50/70 border-sky-300 shadow-md ring-1 ring-sky-300' 
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md shadow-xs'
                    }
                  `}
                >
                  <div>
                    {/* Header: Tag No & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {!isReadOnly && (
                          <span 
                            onClick={() => handleToggleRow(rec.id)}
                            className="cursor-pointer text-slate-400 hover:text-sky-600 transition"
                          >
                            {isSelected ? (
                              <CheckSquare size={17} className="text-sky-600" />
                            ) : (
                              <Square size={17} />
                            )}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 font-mono text-xs font-bold text-sky-700">
                          <span>{rec.tagNo}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyTag(e, rec.tagNo, rec.id)}
                            className="text-slate-400 hover:text-slate-700 transition ml-1"
                            title="Copy Tag No"
                          >
                            {copiedTagId === rec.id ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {rec.entity}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {rec.location}
                        </span>
                      </div>
                    </div>

                    {/* User Info Bar */}
                    <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                        {userInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Allocated To</div>
                        <div className="text-xs font-bold text-slate-900 truncate">{rec.userName}</div>
                        {rec.systemIp && (
                          <div className="text-[11px] font-mono text-sky-700 truncate">IP: {rec.systemIp}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {activeAssets.length} Assets
                        </span>
                      </div>
                    </div>

                    {/* Hardware checklist chips */}
                    <div className="mb-4">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>Hardware Assigned</span>
                        <span className="text-slate-700 font-semibold">{activeAssets.length}/14</span>
                      </div>
                      {activeAssets.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-1">No hardware items allocated</div>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {activeAssets.map(col => (
                            <span 
                              key={col.key}
                              className={`
                                text-[10px] font-semibold px-2 py-0.5 rounded-md border
                                ${selectedAssetFilter === col.key 
                                  ? 'bg-sky-100 border-sky-400 text-sky-800' 
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                                }
                              `}
                            >
                              {col.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => onViewTagBadge(rec)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-semibold transition text-xs shadow-2xs"
                    >
                      <QrCode size={14} />
                      <span>QR Badge</span>
                    </button>

                    {!isReadOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicate(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Duplicate"
                        >
                          <CopyPlus size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete asset tag ${rec.tagNo} assigned to ${rec.userName}?`)) {
                              onDelete(rec.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className={`glass-panel table-container ${viewMode === 'table' ? 'block' : (viewMode === 'cards' ? 'hidden' : 'hidden lg:block')}`}>
        <table className="asset-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                {!isReadOnly ? (
                  <span 
                    onClick={handleSelectAll} 
                    style={{ cursor: 'pointer', display: 'inline-flex' }}
                    title={isAllSelected ? 'Deselect all' : 'Select all'}
                  >
                    {isAllSelected ? (
                      <CheckSquare size={16} style={{ color: '#38bdf8' }} />
                    ) : (
                      <Square size={16} style={{ color: '#64748b' }} />
                    )}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>#</span>
                )}
              </th>

              <th className="sortable" onClick={() => handleSort('tagNo')} style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Tag No</span>
                  {sortField === 'tagNo' ? (
                    sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={13} style={{ opacity: 0.4 }} />
                  )}
                </div>
              </th>

              <th className="sortable" onClick={() => handleSort('userName')} style={{ minWidth: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>User Name</span>
                  {sortField === 'userName' ? (
                    sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={13} style={{ opacity: 0.4 }} />
                  )}
                </div>
              </th>

              <th className="sortable" onClick={() => handleSort('systemIp')} style={{ minWidth: '130px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>System IP</span>
                  {sortField === 'systemIp' ? (
                    sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={13} style={{ opacity: 0.4 }} />
                  )}
                </div>
              </th>

              <th className="sortable" onClick={() => handleSort('entity')} style={{ minWidth: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Entity</span>
                  {sortField === 'entity' ? (
                    sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={13} style={{ opacity: 0.4 }} />
                  )}
                </div>
              </th>

              <th className="sortable" onClick={() => handleSort('location')} style={{ minWidth: '130px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Location</span>
                  {sortField === 'location' ? (
                    sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={13} style={{ opacity: 0.4 }} />
                  )}
                </div>
              </th>

              <th className="sortable" onClick={() => handleSort('assetCount')} style={{ minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Assigned Assets (14 Classes)</span>
                  {sortField === 'assetCount' ? (
                    sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={13} style={{ opacity: 0.4 }} />
                  )}
                </div>
              </th>

              <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Search size={36} style={{ color: '#475569' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>
                      No asset allocations match your filter criteria
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      Try clearing your search terms or register a new Tag No.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map(rec => {
                const isSelected = selectedIds.has(rec.id);
                const activeAssets = ASSET_COLUMNS.filter(col => rec.assets?.[col.key]);
                const userInitials = (rec.userName || 'U')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr 
                    key={rec.id} 
                    className={isSelected ? 'selected' : ''}
                  >
                    <td style={{ textAlign: 'center' }}>
                      {!isReadOnly ? (
                        <span 
                          onClick={() => handleToggleRow(rec.id)}
                          style={{ cursor: 'pointer', display: 'inline-flex' }}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} style={{ color: '#38bdf8' }} />
                          ) : (
                            <Square size={16} style={{ color: '#475569' }} />
                          )}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {filteredRecords.indexOf(rec) + 1}
                        </span>
                      )}
                    </td>

                    {/* Tag No */}
                    <td>
                      <div className="tag-badge">
                        <span>{rec.tagNo}</span>
                        <button
                          className="copy-btn"
                          onClick={(e) => handleCopyTag(e, rec.tagNo, rec.id)}
                          title="Copy Tag No to clipboard"
                        >
                          {copiedTagId === rec.id ? (
                            <Check size={12} style={{ color: '#34d399' }} />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* User Name */}
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{userInitials}</div>
                        <div className="user-name">{rec.userName}</div>
                      </div>
                    </td>

                    {/* System IP */}
                    <td>
                      {rec.systemIp ? (
                        <span className="badge-pill font-mono text-[11px]" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                          {rec.systemIp}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    {/* Entity */}
                    <td>
                      <span className="badge-pill badge-entity">
                        {rec.entity}
                      </span>
                    </td>

                    {/* Location */}
                    <td>
                      <span className="badge-pill badge-loc">
                        {rec.location}
                      </span>
                    </td>

                    {/* Assigned Assets Pills */}
                    <td>
                      <div className="asset-pill-grid">
                        {activeAssets.length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                            No assets assigned
                          </span>
                        ) : (
                          activeAssets.map(col => (
                            <span 
                              key={col.key} 
                              className={`asset-pill ${selectedAssetFilter === col.key ? 'active' : ''}`}
                              title={`${col.label} (${col.category})`}
                            >
                              <span>{col.label}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                          className="btn-icon"
                          onClick={() => onViewTagBadge(rec)}
                          title="Generate physical Asset Tag Badge with QR code"
                        >
                          <QrCode size={16} style={{ color: '#38bdf8' }} />
                        </button>

                        {!isReadOnly && (
                          <>
                            <button
                              className="btn-icon"
                              onClick={() => onDuplicate(rec)}
                              title="Duplicate record (auto-increments Tag No)"
                            >
                              <CopyPlus size={15} />
                            </button>

                            <button
                              className="btn-icon"
                              onClick={() => onEdit(rec)}
                              title="Edit asset allocation"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              className="btn-icon"
                              style={{ color: '#f87171' }}
                              onClick={() => {
                                if (window.confirm(`Delete asset tag ${rec.tagNo} assigned to ${rec.userName}?`)) {
                                  onDelete(rec.id);
                                }
                              }}
                              title="Delete record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: '#94a3b8',
        padding: '0 0.5rem'
      }}>
        <div>
          Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> total records
        </div>
        <div>
          Schema: Tag No / Entity / Location / User Name / System IP / Asset1..14
        </div>
      </div>
    </div>
  );
}
