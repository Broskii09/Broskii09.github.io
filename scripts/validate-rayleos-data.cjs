const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const allowedAvailabilityStatuses = new Set(['Available', 'Booked', 'Hold', 'Needs Support', 'Unavailable']);
const publicShowStatuses = new Set(['confirmed']);
const publicShowVisibilities = new Set(['public']);
const privateTerms = [
  /guarantee/i,
  /door\s*split/i,
  /payment\s*terms/i,
  /staff(?:ing)?\s*notes?/i,
  /promoter\s*notes?/i,
  /internal\s*booking/i,
  /private\s+calendar/i,
  /staff\s+only/i
];

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`Data validation: ${message}`);
}

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateDate(value, context) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    fail(`${context} must use YYYY-MM-DD date format`);
  }
}

function validateNoPrivateText(value, context) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (!text) return;

  for (const pattern of privateTerms) {
    if (pattern.test(text)) {
      fail(`${context} appears to include private/internal wording: ${pattern}`);
    }
  }
}

function validateAvailability(items) {
  if (!Array.isArray(items)) {
    fail('RayLeos/assets/data/availability.json must be an array');
    return;
  }

  items.forEach((item, index) => {
    const context = `availability[${index}]`;
    ['date', 'startTime', 'endTime', 'status'].forEach(field => {
      if (!(field in item)) fail(`${context}.${field} is required`);
    });

    if (!isNonEmptyString(item.date)) fail(`${context}.date must be a non-empty string`);
    if (!isNonEmptyString(item.startTime)) fail(`${context}.startTime must be a non-empty string`);
    if (typeof item.endTime !== 'string') fail(`${context}.endTime must be a string, even when blank`);
    if (!allowedAvailabilityStatuses.has(item.status)) {
      fail(`${context}.status must be one of ${Array.from(allowedAvailabilityStatuses).join(', ')}`);
    }

    validateDate(item.date, `${context}.date`);
    validateNoPrivateText(item, context);
  });
}

function validateShows(items) {
  if (!Array.isArray(items)) {
    fail('RayLeos/assets/data/shows.json must be an array');
    return;
  }

  items.forEach((item, index) => {
    const context = `shows[${index}]`;
    ['id', 'title', 'status', 'visibility', 'date', 'startTime', 'endTime', 'lineup', 'publicDescription'].forEach(field => {
      if (!(field in item)) fail(`${context}.${field} is required`);
    });

    ['id', 'title', 'status', 'visibility', 'date', 'startTime', 'endTime', 'publicDescription'].forEach(field => {
      if (!isNonEmptyString(item[field])) fail(`${context}.${field} must be a non-empty string`);
    });

    if (!publicShowStatuses.has(String(item.status || '').toLowerCase())) {
      fail(`${context}.status must be confirmed for public show data`);
    }

    if (!publicShowVisibilities.has(String(item.visibility || '').toLowerCase())) {
      fail(`${context}.visibility must be public for public show data`);
    }

    if (!Array.isArray(item.lineup) || item.lineup.length === 0) {
      fail(`${context}.lineup must be a non-empty array`);
    } else {
      item.lineup.forEach((name, lineupIndex) => {
        if (!isNonEmptyString(name)) fail(`${context}.lineup[${lineupIndex}] must be a non-empty string`);
      });
    }

    if ('tags' in item && !Array.isArray(item.tags)) fail(`${context}.tags must be an array when present`);
    if ('support' in item && !Array.isArray(item.support)) fail(`${context}.support must be an array when present`);
    if ('source' in item && (!item.source || typeof item.source !== 'object' || Array.isArray(item.source))) fail(`${context}.source must be an object when present`);
    if ('source' in item && item.source && !isNonEmptyString(item.source.type)) fail(`${context}.source.type must be a non-empty string when source is present`);
    if ('ticketUrl' in item && item.ticketUrl && !/^https?:\/\//.test(String(item.ticketUrl))) fail(`${context}.ticketUrl must be an http(s) URL when present`);
    if ('detailUrl' in item && item.detailUrl && !/^https?:\/\//.test(String(item.detailUrl))) fail(`${context}.detailUrl must be an http(s) URL when present`);
    if ('posterImage' in item && typeof item.posterImage !== 'string') fail(`${context}.posterImage must be a string when present`);
    if (!('doorsTime' in item) && !('doors' in item)) fail(`${context}.doorsTime is required`);
    if (!('showTime' in item) && !('show' in item)) fail(`${context}.showTime is required`);
    if (!('agePolicy' in item) && !('age' in item)) fail(`${context}.agePolicy is required`);
    validateDate(item.date, `${context}.date`);
    validateNoPrivateText(item, context);
  });
}

validateShows(readJson('RayLeos/assets/data/shows.json'));
validateAvailability(readJson('RayLeos/assets/data/availability.json'));

if (failures > 0) {
  process.exit(1);
}

console.log('RayLeos data validation passed');
