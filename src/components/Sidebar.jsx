import React from 'react';
import { 
  Layers, 
  LayoutDashboard, 
  Table as TableIcon, 
  FileEdit, 
  X, 
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  currentRoute,
  onNavigateTab,
  permittedTabs = [],
  totalRecords = 0
}) {
  const isAdmin = currentUser?.role === 'ADMIN';

  // The 3 primary navigation options
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-sky-600',
      activeBg: 'bg-sky-50 text-sky-700 border-sky-300'
    },
    {
      id: 'table',
      label: 'Asset Register',
      icon: TableIcon,
      color: 'text-indigo-600',
      activeBg: 'bg-indigo-50 text-indigo-700 border-indigo-300'
    },
    {
      id: 'form',
      label: 'Asset Entry Form',
      icon: FileEdit,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300'
    }
  ];

  // Filter navigation items by user permissions
  const visibleNavItems = navItems.filter(item => 
    permittedTabs.some(t => t.id === item.id)
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          lg:static lg:sticky lg:top-0 lg:h-screen lg:z-30 shrink-0
          bg-white border-r border-slate-200 text-slate-800
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 min-h-[64px]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
              <Layers size={22} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 truncate">
                    AssetPulse
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-300 px-1.5 py-0.5 rounded-full">
                    Pro
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Enterprise Management
                </div>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button 
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            onClick={onClose}
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="p-3 border-b border-slate-100">
            <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                {(currentUser.username || 'U').charAt(0).toUpperCase()}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {currentUser.displayName || currentUser.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isAdmin ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                      {currentUser.role}
                    </span>
                    {currentUser.entity && (
                      <span className="text-[10px] text-slate-500 font-medium truncate">
                        • {currentUser.entity}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links: Exactly the 3 menu options */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Menu
              </div>
            )}
            <nav className="space-y-1">
              {visibleNavItems.map(item => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigateTab(item.id);
                      onClose();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                      font-medium text-xs transition-all duration-150
                      ${isCollapsed ? 'justify-center' : ''}
                      ${isActive 
                        ? `${item.activeBg} font-bold shadow-xs border` 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      }
                    `}
                  >
                    <Icon size={18} className={`shrink-0 ${isActive ? item.color : 'text-slate-400'}`} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer / System Status */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Database size={13} className="text-sky-600" />
                <span>{totalRecords} Total Records</span>
              </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
