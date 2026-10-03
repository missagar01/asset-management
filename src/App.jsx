import React, { useState, useEffect, useMemo } from 'react';
import { LoginPage } from './components/LoginPage';
import { UserPortal } from './components/UserPortal';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { MetricsOverview } from './components/MetricsOverview';
import { AssetTable } from './components/AssetTable';
import { AssetFormModal } from './components/AssetFormModal';
import { TagBadgeModal } from './components/TagBadgeModal';
import { ImportModal } from './components/ImportModal';
import { ExportModal } from './components/ExportModal';
import { LayoutDashboard, Table, FileEdit } from 'lucide-react';
import { INITIAL_SAMPLE_RECORDS, ASSET_COLUMNS } from './constants/assets';
import { AUTH_STORAGE_KEY } from './constants/auth';
import { generateTagNo } from './utils/tagGenerator';
import { parseUserPermissions } from './utils/routePermissions';
import { 
  postAssetToGoogleSheet, 
  deleteAssetFromGoogleSheet,
  isDeployedUrlConfigured, 
  fetchAssetsFromGoogleSheet,
  fetchMastersData,
  getStoredMastersUsers,
  getStoredEntities
} from './services/googleSheetService';

const LOCAL_STORAGE_KEY = 'assetflow_records_v1';

export function App() {
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Masters sheet state (users and entities)
  const [mastersUsers, setMastersUsers] = useState(() => getStoredMastersUsers());
  const [availableEntities, setAvailableEntities] = useState(() => getStoredEntities());

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
    return null;
  });

  // Calculate dynamic route permissions from Masters sheet page_access & role
  const permissions = useMemo(() => {
    return parseUserPermissions(currentUser?.pageAccess, currentUser?.role);
  }, [currentUser]);

  // Current active view: 'dashboard' | 'table' | 'form'
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['dashboard', 'table', 'form'].includes(hash)) {
      return hash;
    }
    return 'dashboard';
  });

  // Synchronize route when user or permissions change
  useEffect(() => {
    if (!currentUser) return;
    if (permissions.isFormOnly) {
      setCurrentRoute('form');
      return;
    }
    if (permissions.isTableOnly) {
      setCurrentRoute('table');
      return;
    }
    const isAllowed = permissions.permittedTabs.some(t => t.id === currentRoute);
    if (!isAllowed) {
      setCurrentRoute(permissions.defaultRoute || 'dashboard');
    }
  }, [permissions, currentUser]);

  const handleNavigateTab = (tabId) => {
    setCurrentRoute(tabId);
    window.location.hash = `#${tabId}`;
  };

  // Records Repository (starts clean with 0 demo data)
  const [records, setRecords] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored records contain the old mock sample data, purge it
          const isOldDemo = parsed.some(r => r.id === 'rec-001' || r.userName === 'Rajesh Sharma' || r.tagNo?.includes('CORP/MUMBAI-HQ/0001'));
          if (!isOldDemo) {
            return parsed;
          }
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to read localStorage:', e);
    }
    return [];
  });

  // Admin Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [badgeRecord, setBadgeRecord] = useState(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Asset device filter state (e.g. 'Asset1', 'Asset11', etc.)
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('');

  // Quick feedback toast
  const [quickCopied, setQuickCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Fetch Masters sheet users & entities and assets on mount
  useEffect(() => {
    if (isDeployedUrlConfigured()) {
      fetchMastersData().then(res => {
        if (res && res.success) {
          if (Array.isArray(res.masters) && res.masters.length > 0) {
            setMastersUsers(res.masters);
          }
          if (Array.isArray(res.entities) && res.entities.length > 0) {
            setAvailableEntities(res.entities);
          }
        }
      }).catch(err => {
        console.warn('Background Masters sync:', err);
      });

      fetchAssetsFromGoogleSheet().then(res => {
        if (res && res.success) {
          if (Array.isArray(res.records)) {
            setRecords(res.records);
          }
          if (Array.isArray(res.entities) && res.entities.length > 0) {
            setAvailableEntities(res.entities);
          }
        }
      }).catch(err => {
        console.warn('Background Assets sync:', err);
      });
    }
  }, []);

  // Sync records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [records]);

  // Sync auth state to localStorage
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to store auth session:', e);
    }
    showToast(`Welcome back, ${user.displayName}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth session:', e);
    }
    showToast('Signed out successfully');
  };

  // Handler: Add New
  const handleAddNew = () => {
    setEditRecord(null);
    setIsFormOpen(true);
  };

  // Handler: Edit
  const handleEdit = (record) => {
    setEditRecord(record);
    setIsFormOpen(true);
  };

  // Handler: Duplicate with next auto-incremented Tag No
  const handleDuplicate = (record) => {
    const nextTagNo = generateTagNo(record.entity, record.location, records);
    const newRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tagNo: nextTagNo,
      userName: `${record.userName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRecords(prev => [newRecord, ...prev]);
    showToast(`Duplicated with new Tag No: ${nextTagNo}`);
    
    // Also sync to cloud if configured
    if (isDeployedUrlConfigured()) {
      postAssetToGoogleSheet(newRecord);
    }
  };

  // Handler: Save / Update Record
  const handleSaveRecord = (savedRecord) => {
    setRecords(prev => {
      const targetTag = (savedRecord.originalTagNo || savedRecord.tagNo || '').trim().toUpperCase();
      const index = prev.findIndex(r => 
        r.id === savedRecord.id || 
        (targetTag && (r.tagNo || '').trim().toUpperCase() === targetTag)
      );

      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...savedRecord };
        return updated;
      } else {
        return [savedRecord, ...prev];
      }
    });

    showToast(`Saved ${savedRecord.tagNo} (${savedRecord.userName})`);

    // Sync to deployed cloud endpoint if active
    if (isDeployedUrlConfigured()) {
      postAssetToGoogleSheet(savedRecord);
    }
  };

  // Handler: Delete Single
  const handleDelete = (id) => {
    const toDelete = records.find(r => r.id === id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showToast('Asset record deleted');

    if (toDelete && isDeployedUrlConfigured()) {
      deleteAssetFromGoogleSheet(toDelete.tagNo);
    }
  };

  // Handler: Delete Selected
  const handleDeleteSelected = (selectedIds) => {
    const idSet = new Set(selectedIds);
    const toDelete = records.filter(r => idSet.has(r.id));
    setRecords(prev => prev.filter(r => !idSet.has(r.id)));
    showToast(`${selectedIds.length} records removed`);

    if (isDeployedUrlConfigured()) {
      toDelete.forEach(r => {
        deleteAssetFromGoogleSheet(r.tagNo);
      });
    }
  };

  // Handler: Export Selected
  const handleExportSelected = (selectedIds) => {
    const idSet = new Set(selectedIds);
    const subset = records.filter(r => idSet.has(r.id));
    downloadCsvFile(subset, `Asset_Registry_Selected_${subset.length}.csv`, 'TRUE_FALSE');
    showToast(`Exported ${subset.length} records to CSV`);
  };

  // Handler: Open Physical Tag Badge
  const handleViewTagBadge = (record) => {
    setBadgeRecord(record);
    setIsBadgeOpen(true);
  };

  // Handler: Quick Copy Table (TSV format)
  const handleQuickCopySheet = () => {
    const tsv = generateSheetTsv(records, 'TRUE_FALSE');
    navigator.clipboard.writeText(tsv);
    setQuickCopied(true);
    showToast('Copied table to clipboard (TSV format)!');
    setTimeout(() => setQuickCopied(false), 2400);
  };

  // Handler: Import
  const handleImportRecords = (newRecords, mode) => {
    if (mode === 'replace') {
      setRecords(newRecords);
      showToast(`Replaced all with ${newRecords.length} records`);
    } else {
      // Append mode: merge
      setRecords(prev => [...newRecords, ...prev]);
      showToast(`Imported ${newRecords.length} new records`);
    }
  };

  // Handler: Live Pull from Deployed Cloud Endpoint
  const handleSyncFromSheet = async () => {
    setIsSyncingSheet(true);
    showToast('Syncing with cloud database...');
    try {
      const res = await fetchAssetsFromGoogleSheet();
      if (res.success) {
        if (Array.isArray(res.records)) {
          setRecords(res.records);
        }
        if (Array.isArray(res.entities) && res.entities.length > 0) {
          setAvailableEntities(res.entities);
        }
        if (Array.isArray(res.masters) && res.masters.length > 0) {
          setMastersUsers(res.masters);
        }
        showToast(`Synced ${res.records?.length || 0} records & ${res.entities?.length || 0} entities from cloud!`);
      } else {
        showToast(res.message || 'No records returned from cloud database');
      }
    } catch (err) {
      showToast('Error syncing with cloud database');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Handler: Reset Demo Data
  const handleResetData = () => {
    if (window.confirm('Reset all records to initial demo database? This will replace your local changes.')) {
      setRecords(INITIAL_SAMPLE_RECORDS);
      showToast('Database reset to initial sample assets');
    }
  };

  // 1. If not logged in -> Show Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} mastersList={mastersUsers} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Responsive Enterprise Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigateTab={handleNavigateTab}
        permittedTabs={permissions.permittedTabs}
        onAddNew={handleAddNew}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onQuickCopySheet={handleQuickCopySheet}
        onResetData={handleResetData}
        onSyncFromSheet={handleSyncFromSheet}
        isSyncingSheet={isSyncingSheet}
        copiedFeedback={quickCopied}
        totalRecords={records.length}
      />

      {/* Main Content Area: Natural flex sibling to sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          currentRoute={currentRoute}
          onAddNew={handleAddNew}
          onSyncFromSheet={handleSyncFromSheet}
          isSyncingSheet={isSyncingSheet}
          totalRecords={records.length}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #38bdf8',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.3)',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              zIndex: 9999,
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Active View */}
          {currentRoute === 'form' && (
            <UserPortal
              currentUser={currentUser}
              onLogout={handleLogout}
              onSaveRecord={handleSaveRecord}
              existingRecords={records}
              availableEntities={availableEntities}
              permittedTabs={permissions.permittedTabs}
              currentRoute={currentRoute}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentRoute === 'dashboard' && (
            <div className="space-y-6">
              <MetricsOverview
                records={records}
                onSelectAssetFilter={setSelectedAssetFilter}
                selectedAssetFilter={selectedAssetFilter}
              />
              <AssetTable
                records={records}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onViewTagBadge={handleViewTagBadge}
                onDeleteSelected={handleDeleteSelected}
                onExportSelected={handleExportSelected}
                selectedAssetFilter={selectedAssetFilter}
                setSelectedAssetFilter={setSelectedAssetFilter}
                isReadOnly={permissions.isReadOnlyTable}
              />
            </div>
          )}

          {currentRoute === 'table' && (
            <AssetTable
              records={records}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onViewTagBadge={handleViewTagBadge}
              onDeleteSelected={handleDeleteSelected}
              onExportSelected={handleExportSelected}
              selectedAssetFilter={selectedAssetFilter}
              setSelectedAssetFilter={setSelectedAssetFilter}
              isReadOnly={permissions.isReadOnlyTable}
            />
          )}
        </main>
      </div>

      {/* Modal: Add / Edit Record */}
      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRecord}
        editRecord={editRecord}
        existingRecords={records}
        availableEntities={availableEntities}
      />

      {/* Modal: Physical Asset Tag Badge Preview & Print */}
      <TagBadgeModal
        isOpen={isBadgeOpen}
        onClose={() => setIsBadgeOpen(false)}
        record={badgeRecord}
      />

      {/* Modal: Import from Google Sheet */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportRecords}
        existingRecords={records}
      />

      {/* Modal: Export Dataset */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        records={records}
      />
    </div>
  );
}

export default App;
