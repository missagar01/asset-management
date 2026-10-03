// Default fallback authorized users
export const USERS = [
  {
    id: 'user-admin-1',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    pageAccess: 'ALL',
    status: 'ACTIVE',
    entity: '',
    displayName: 'System Administrator',
    description: 'Full access to Dashboard, Analytics, Cloud Sync, Table, and Admin Settings'
  },
  {
    id: 'user-staff-2',
    username: 'user',
    password: 'user123',
    role: 'USER',
    pageAccess: 'FORM',
    status: 'ACTIVE',
    entity: '',
    displayName: 'Standard User',
    description: 'Form-only access to register new hardware assets and auto-generate Tag Numbers'
  }
];

export const AUTH_STORAGE_KEY = 'assetflow_auth_session';

/**
 * Validate credentials against Masters sheet users (with fallback to default users)
 * 
 * Masters columns: user_id, password, role, page_access, status, entity
 */
export function authenticateUser(username, password, mastersList = []) {
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'Please enter both username and password' };
  }

  // 1. First check dynamic users from Masters sheet
  if (Array.isArray(mastersList) && mastersList.length > 0) {
    const masterMatch = mastersList.find(
      m => String(m.userId || '').trim().toLowerCase() === cleanUsername
    );

    if (masterMatch) {
      if (String(masterMatch.password || '').trim() !== cleanPassword) {
        return { success: false, error: 'Incorrect password' };
      }

      const status = String(masterMatch.status || 'ACTIVE').trim().toUpperCase();
      if (status !== 'ACTIVE' && status !== 'ENABLED' && status !== '1' && status !== 'TRUE') {
        return { success: false, error: `Account status is ${status}. Access denied.` };
      }

      const role = String(masterMatch.role || 'USER').trim().toUpperCase();
      const pageAccess = String(masterMatch.pageAccess || (role === 'ADMIN' ? 'ALL' : 'FORM')).trim().toUpperCase();
      const entity = String(masterMatch.entity || '').trim().toUpperCase();

      return {
        success: true,
        user: {
          id: `master-${masterMatch.userId}`,
          username: masterMatch.userId,
          role,
          pageAccess,
          status,
          entity,
          displayName: masterMatch.userId.charAt(0).toUpperCase() + masterMatch.userId.slice(1),
          source: 'Masters'
        }
      };
    }
  }

  // 2. Fallback check built-in default users
  const fallbackMatch = USERS.find(
    u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
  );

  if (fallbackMatch) {
    const { password: _, ...userSafe } = fallbackMatch;
    return {
      success: true,
      user: {
        ...userSafe,
        source: 'Built-in'
      }
    };
  }

  return { success: false, error: 'Invalid username or password' };
}
