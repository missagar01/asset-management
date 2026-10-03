import { ASSET_COLUMNS, SHEET1_HEADERS } from '../constants/assets';

/**
 * Get configured Google Apps Script Web App URL from environment
 */
export function getDeployedSheetUrl() {
  return import.meta.env.VITE_GOOGLE_SHEET_DEPLOYED_URL || '';
}

/**
 * Check if a valid deployed URL is set
 */
export function isDeployedUrlConfigured() {
  const url = getDeployedSheetUrl();
  return Boolean(
    url && 
    url.startsWith('https://script.google.com') && 
    !url.includes('YOUR_DEPLOYED_WEBAPP_ID') &&
    !url.includes('YOUR_SCRIPT_ID')
  );
}

/**
 * Send an asset record to the deployed Google Sheet Web App endpoint
 * 
 * @param {Object} record - The asset record object
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function postAssetToGoogleSheet(record) {
  const deployedUrl = getDeployedSheetUrl();

  if (!isDeployedUrlConfigured()) {
    console.warn('Google Sheet Deployed URL is not configured in .env');
    return {
      success: false,
      status: 'unconfigured',
      message: 'Google Sheet Deployed URL is not configured in .env'
    };
  }

  // Format row matching Sheet1's 18 columns
  const payload = {
    action: record.action || 'save',
    tagNo: record.tagNo,
    originalTagNo: record.originalTagNo || record.tagNo,
    entity: record.entity,
    location: record.location,
    userName: record.userName,
    // Store asset label name if checked, or keep blank if unchecked
    ...ASSET_COLUMNS.reduce((acc, col) => {
      acc[col.key] = record.assets?.[col.key] ? col.label : '';
      return acc;
    }, {})
  };

  try {
    // Google Apps Script Web Apps with 'Anyone' access can be sent payload via POST
    await fetch(deployedUrl, {
      method: 'POST',
      mode: 'no-cors', // Standard for client-side Google Apps Script webhook
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      status: 'submitted',
      message: 'Successfully synchronized with cloud registry!'
    };
  } catch (err) {
    console.error('Error posting to cloud endpoint:', err);
    return {
      success: false,
      status: 'error',
      message: err.message || 'Failed to communicate with cloud endpoint'
    };
  }
}

/**
 * Delete an asset record from the deployed Google Sheet Web App by Tag No
 * 
 * @param {string} tagNo - The Tag Number to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function deleteAssetFromGoogleSheet(tagNo) {
  const deployedUrl = getDeployedSheetUrl();

  if (!isDeployedUrlConfigured() || !tagNo) {
    return { success: false, message: 'Deployed URL not configured or missing Tag No' };
  }

  try {
    await fetch(deployedUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'delete',
        tagNo: String(tagNo).trim().toUpperCase()
      })
    });

    return { success: true, message: `Deleted ${tagNo} from cloud database` };
  } catch (err) {
    console.error('Error deleting from cloud endpoint:', err);
    return { success: false, message: err.message };
  }
}

const MASTERS_USERS_STORAGE_KEY = 'assetflow_masters_users';
const MASTERS_ENTITIES_STORAGE_KEY = 'assetflow_masters_entities';

/**
 * Retrieve cached masters users from localStorage
 */
export function getStoredMastersUsers() {
  try {
    const raw = localStorage.getItem(MASTERS_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading stored masters users:', e);
  }
  return [];
}

/**
 * Retrieve cached entities from localStorage
 */
export function getStoredEntities() {
  try {
    const raw = localStorage.getItem(MASTERS_ENTITIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading stored entities:', e);
  }
  return [];
}

/**
 * Fetch all assets and masters directly from deployed cloud endpoint
 */
export async function fetchAssetsFromGoogleSheet() {
  const deployedUrl = getDeployedSheetUrl();

  if (!isDeployedUrlConfigured()) {
    return {
      success: false,
      message: 'Cloud Endpoint URL is not configured in .env',
      records: []
    };
  }

  try {
    const res = await fetch(deployedUrl, { method: 'GET' });
    const data = await res.json();
    
    // Check if response contains unified object with assets, masters, and entities
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (Array.isArray(data.entities) && data.entities.length > 0) {
        localStorage.setItem(MASTERS_ENTITIES_STORAGE_KEY, JSON.stringify(data.entities));
      }
      if (Array.isArray(data.masters) && data.masters.length > 0) {
        localStorage.setItem(MASTERS_USERS_STORAGE_KEY, JSON.stringify(data.masters));
      }

      const records = Array.isArray(data.assets) ? data.assets : [];
      return {
        success: true,
        records,
        entities: data.entities || [],
        masters: data.masters || [],
        message: `Successfully synchronized ${records.length} assets and ${data.entities?.length || 0} entities from cloud!`
      };
    }

    if (Array.isArray(data)) {
      return {
        success: true,
        records: data,
        message: `Successfully synchronized ${data.length} assets with cloud!`
      };
    }

    return {
      success: false,
      records: [],
      message: 'Unexpected response from cloud endpoint'
    };
  } catch (err) {
    console.error('Error fetching from cloud endpoint:', err);
    return {
      success: false,
      records: [],
      message: 'Could not connect to cloud endpoint. Check deployment settings.'
    };
  }
}

/**
 * Fetch masters and entities explicitly from Masters sheet
 */
export async function fetchMastersData() {
  const deployedUrl = getDeployedSheetUrl();

  if (!isDeployedUrlConfigured()) {
    return {
      success: false,
      masters: getStoredMastersUsers(),
      entities: getStoredEntities(),
      message: 'Cloud Endpoint URL not set; using local cache.'
    };
  }

  try {
    const separator = deployedUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${deployedUrl}${separator}action=masters`, { method: 'GET' });
    const data = await res.json();

    if (data && data.status === 'success') {
      const masters = Array.isArray(data.masters) ? data.masters : [];
      const entities = Array.isArray(data.entities) ? data.entities : [];

      if (masters.length > 0) {
        localStorage.setItem(MASTERS_USERS_STORAGE_KEY, JSON.stringify(masters));
      }
      if (entities.length > 0) {
        localStorage.setItem(MASTERS_ENTITIES_STORAGE_KEY, JSON.stringify(entities));
      }

      return {
        success: true,
        masters,
        entities,
        message: `Loaded ${masters.length} users and ${entities.length} entities from Masters sheet.`
      };
    }

    return {
      success: false,
      masters: getStoredMastersUsers(),
      entities: getStoredEntities(),
      message: 'Could not retrieve masters from cloud.'
    };
  } catch (err) {
    console.error('Error fetching masters data:', err);
    return {
      success: false,
      masters: getStoredMastersUsers(),
      entities: getStoredEntities(),
      message: err.message
    };
  }
}


