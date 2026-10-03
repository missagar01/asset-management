import React from 'react';
import { 
  Menu, 
  Layers, 
  PlusCircle, 
  RefreshCw, 
  LogOut, 
  ShieldCheck, 
  User
} from 'lucide-react';
import { isDeployedUrlConfigured } from '../services/googleSheetService';

export function TopNavbar({
  onOpenMobileSidebar,
  currentUser,
  onLogout,
  currentRoute,
  onAddNew,
  onSyncFromSheet,
  isSyncingSheet,
  totalRecords = 0
}) {
  const isSheetConnected = isDeployedUrlConfigured();
  const isAdmin = currentUser?.role === 'ADMIN';

  const routeTitles = {
    dashboard: { title: 'Dashboard & Analytics', subtitle: 'Overview of hardware asset distribution' },
    table: { title: 'Asset Register Directory', subtitle: 'Search, filter, and manage hardware allocations' },
    form: { title: 'Asset Registration Form', subtitle: 'Register allocation and auto-generate Tag No' }
  };

  const currentInfo = routeTitles[currentRoute] || routeTitles.dashboard;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 min-h-[64px] flex items-center justify-between gap-3 shadow-xs">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200 shrink-0"
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Mobile Brand Title */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers size={18} />
          </div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
            AssetPulse
          </span>
        </div>

        {/* Desktop Breadcrumb / Title */}
        <div className="hidden lg:block truncate">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
              {currentInfo.title}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {totalRecords} Records
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {isSheetConnected && (
          <button
            type="button"
            onClick={onSyncFromSheet}
            disabled={isSyncingSheet}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition shadow-xs"
            title="Synchronize records with cloud storage"
          >
            <RefreshCw size={13} className={`text-emerald-600 ${isSyncingSheet ? 'animate-spin' : ''}`} />
            <span>{isSyncingSheet ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/20 active:scale-95 transition"
          title="Create New Asset Tag"
        >
          <PlusCircle size={15} />
          <span className="hidden sm:inline">New Asset</span>
        </button>

        {/* User Pill & Logout */}
        {currentUser && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              {isAdmin ? (
                <ShieldCheck size={14} className="text-sky-600" />
              ) : (
                <User size={14} className="text-emerald-600" />
              )}
              <span className="font-bold text-slate-700 truncate max-w-[110px]">
                {currentUser.username}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
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
