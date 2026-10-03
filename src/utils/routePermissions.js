/**
 * Route & Access Permissions Parser for Masters Sheet
 * 
 * Masters Sheet column: page_access
 * Supported routes & keywords:
 *  - "/form" or "FORM": Dedicated Asset Registration Form only
 *  - "/table" or "TABLE" or "REGISTRY": Asset records table view
 *  - "/dashboard" or "DASHBOARD" or "METRICS": Metrics overview and asset directory
 *  - "ALL" or "*" or "/all" or "ADMIN": Full access to all pages & administrative tools
 *  - Combinations e.g. "/form,/table" or "FORM,TABLE": Multi-page access with navigation tabs
 */

export const ROUTE_KEYS = {
  FORM: '/form',
  TABLE: '/table',
  DASHBOARD: '/dashboard',
  ALL: 'ALL'
};

export function parseUserPermissions(pageAccess = '', role = 'USER') {
  const raw = String(pageAccess || '').trim().toUpperCase();
  const isAdminRole = String(role || '').toUpperCase() === 'ADMIN';

  // Split comma, semicolon or slash-separated routes
  const tokens = raw
    .split(/[,;|]/)
    .map(t => t.trim().replace(/^\//, '')) // remove leading slash: "/FORM" -> "FORM"
    .filter(Boolean);

  const hasAll = tokens.includes('ALL') || 
                  tokens.includes('*') || 
                  tokens.includes('FULL') || 
                  (tokens.length === 0 && isAdminRole);

  const canAccessForm = hasAll || 
                        tokens.includes('FORM') || 
                        tokens.includes('USER') || 
                        tokens.includes('REGISTER') || 
                        tokens.includes('NEW');

  const canAccessTable = hasAll || 
                         tokens.includes('TABLE') || 
                         tokens.includes('REGISTRY') || 
                         tokens.includes('LIST') || 
                         tokens.includes('VIEW');

  const canAccessDashboard = hasAll || 
                             tokens.includes('DASHBOARD') || 
                             tokens.includes('METRICS') || 
                             tokens.includes('ANALYTICS');

  // Build list of permitted navigation tabs
  const permittedTabs = [];
  if (canAccessDashboard) {
    permittedTabs.push({ id: 'dashboard', path: '/dashboard', label: 'Dashboard' });
  }
  if (canAccessTable) {
    permittedTabs.push({ id: 'table', path: '/table', label: 'Asset Register' });
  }
  if (canAccessForm) {
    permittedTabs.push({ id: 'form', path: '/form', label: 'Asset Entry Form' });
  }

  // Determine initial default route
  let defaultRoute = 'form';
  if (canAccessDashboard) {
    defaultRoute = 'dashboard';
  } else if (canAccessTable) {
    defaultRoute = 'table';
  } else if (canAccessForm) {
    defaultRoute = 'form';
  }

  const isFormOnly = canAccessForm && !canAccessTable && !canAccessDashboard;
  const isTableOnly = canAccessTable && !canAccessDashboard && !canAccessForm;

  return {
    raw,
    hasAll,
    canAccessForm,
    canAccessTable,
    canAccessDashboard,
    isFormOnly,
    isTableOnly,
    isAdminRole,
    isReadOnlyTable: !isAdminRole,
    permittedTabs,
    defaultRoute
  };
}
