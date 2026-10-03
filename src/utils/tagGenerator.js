/**
 * Helper to normalize string for Tag No (uppercase, trim, replace slashes)
 */
export function cleanCodePart(text) {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[/\\?%*:|"<>]/g, '-') // sanitize slashes/invalid path chars
    .replace(/\s+/g, '-');
}

/**
 * Automatically generate Tag No in format: Entity/Location/000n
 * 
 * @param {string} entity - The entity name / code
 * @param {string} location - The location name / code
 * @param {Array} existingRecords - List of existing asset records
 * @param {string} currentRecordId - Optional ID of record currently being edited
 * @returns {string} Generated Tag No e.g. 'CORP/MUMBAI/0001'
 */
export function generateTagNo(entity, location, existingRecords = [], currentRecordId = null) {
  const cleanEntity = cleanCodePart(entity) || 'ENTITY';
  const cleanLoc = cleanCodePart(location) || 'LOC';

  const prefix = `${cleanEntity}/${cleanLoc}/`;
  const prefixLower = prefix.toLowerCase();

  let maxNumber = 0;

  for (const rec of existingRecords) {
    // If editing, ignore current record so its own tag doesn't falsely increment
    if (currentRecordId && rec.id === currentRecordId) {
      continue;
    }

    const tag = (rec.tagNo || '').trim();

    // Check if tag starts with Entity/Location/
    if (tag.toLowerCase().startsWith(prefixLower)) {
      const remainder = tag.substring(prefix.length);
      const numMatch = remainder.match(/^(\d+)/);
      if (numMatch) {
        const parsed = parseInt(numMatch[1], 10);
        if (!isNaN(parsed) && parsed > maxNumber) {
          maxNumber = parsed;
        }
      }
    } else {
      // Also check if record entity and location match even if tag had minor variation
      const rEntity = cleanCodePart(rec.entity);
      const rLoc = cleanCodePart(rec.location);
      if (rEntity === cleanEntity && rLoc === cleanLoc) {
        const parts = tag.split('/');
        if (parts.length >= 3) {
          const lastPart = parts[parts.length - 1];
          const parsed = parseInt(lastPart, 10);
          if (!isNaN(parsed) && parsed > maxNumber) {
            maxNumber = parsed;
          }
        }
      }
    }
  }

  const nextNumber = maxNumber + 1;
  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${cleanEntity}/${cleanLoc}/${paddedNumber}`;
}

/**
 * Validate Tag No format
 */
export function validateTagNo(tagNo) {
  if (!tagNo || typeof tagNo !== 'string') {
    return { valid: false, message: 'Tag No is required' };
  }
  const parts = tagNo.trim().split('/');
  if (parts.length < 3) {
    return { valid: false, message: 'Tag No should follow Entity/Location/000n format' };
  }
  const lastPart = parts[parts.length - 1];
  if (!/^\d+$/.test(lastPart)) {
    return { valid: false, message: 'Tag No sequence must end with digits (e.g. 0001)' };
  }
  return { valid: true, message: 'Valid' };
}

/**
 * Deconstruct Tag No into Entity, Location, and Sequence
 */
export function parseTagNo(tagNo) {
  if (!tagNo) return null;
  const parts = tagNo.trim().split('/');
  if (parts.length >= 3) {
    return {
      entity: parts[0],
      location: parts.slice(1, -1).join('/'),
      sequence: parts[parts.length - 1]
    };
  }
  return null;
}
