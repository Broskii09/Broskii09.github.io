const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const EPK_WITH_LINK = 'I have an EPK / press kit link';

const FIELD_LABELS = {
  selectedDate: 'Selected Date',
  selectedTime: 'Selected Time Block',
  selectedStatus: 'Availability Status',
  requestType: 'Request Type',
  artistName: 'Artist/Band',
  contactName: 'Contact',
  email: 'Email',
  phone: 'Phone',
  hometown: 'Hometown / Market',
  genre: 'Genre / Style',
  styleNotes: 'Style Notes',
  members: 'Members',
  setLength: 'Set Length',
  website: 'Website',
  instagram: 'Instagram',
  facebook: 'Facebook',
  musicLinks: 'Music Links',
  liveVideo: 'Live Video',
  epkStatus: 'EPK Status',
  epk: 'EPK Link',
  admat: 'Ad Mat / Poster Assets',
  promoPhotos: 'Promo Photos',
  stagePlot: 'Stage Plot',
  inputList: 'Input List',
  preferredDates: 'Preferred Dates',
  routing: 'Routing Context',
  supportNeeds: 'Support / Bill Needs',
  expectedDraw: 'Expected Draw',
  drawNotes: 'Draw Notes',
  agePolicy: 'All-Ages OK?',
  previousShows: 'Previous Regional Shows',
  dealExpectations: 'Compensation Expectations',
  loadIn: 'Load-in Needs',
  merch: 'Merch Needs',
  lodging: 'Lodging Needs',
  techNotes: 'Tech Notes',
  notes: 'Additional Notes'
};

const FIELD_SECTIONS = [
  ['Requested Date / Event', ['selectedDate', 'selectedTime', 'selectedStatus', 'requestType']],
  ['Artist Basics', ['artistName', 'contactName', 'email', 'phone', 'hometown', 'genre', 'styleNotes', 'members', 'setLength']],
  ['Music / EPK', ['website', 'instagram', 'facebook', 'musicLinks', 'liveVideo', 'epkStatus', 'epk']],
  ['Routing / Dates', ['preferredDates', 'routing', 'supportNeeds', 'expectedDraw', 'drawNotes']],
  ['Promo Assets', ['admat', 'promoPhotos']],
  ['Tech / Logistics', ['stagePlot', 'inputList', 'agePolicy', 'previousShows', 'dealExpectations', 'loadIn', 'merch', 'lodging', 'techNotes']],
  ['Additional Notes', ['notes']]
];

const REQUIRED_FIELDS = ['artistName', 'contactName', 'email', 'hometown', 'genre', 'musicLinks', 'epkStatus', 'preferredDates', 'expectedDraw'];
const URL_FIELDS = ['website', 'instagram', 'facebook', 'musicLinks', 'liveVideo', 'epk', 'admat', 'promoPhotos', 'stagePlot', 'inputList'];

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return optionsResponse(request, env);
    if (request.method !== 'POST') return jsonResponse(request, env, { success: false, message: 'Use POST to submit a booking request.' }, 405);

    try {
      const body = await request.json();
      const payload = normalizePayload(body);
      const validation = validatePayload(payload);
      if (!validation.valid) {
        return jsonResponse(request, env, { success: false, message: 'Please fix the booking request fields.', errors: validation.errors }, 400);
      }

      assertEnv(env);
      const submissionId = crypto.randomUUID();
      const subject = buildSubject(payload.fields);
      const text = buildTextEmail(payload, submissionId);
      const html = buildHtmlEmail(payload, submissionId);
      const cc = parseCcEmails(env.BOOKING_CC_EMAILS, [env.BOOKING_TO_EMAIL, payload.fields.email]);
      const adminEmail = {
        from: env.BOOKING_FROM_EMAIL,
        to: [env.BOOKING_TO_EMAIL],
        reply_to: payload.fields.email,
        subject,
        text,
        html
      };
      if (cc.length) adminEmail.cc = cc;

      await sendResendEmail(env, adminEmail);

      if (truthy(env.BOOKING_SEND_CONFIRMATION)) {
        await sendResendEmail(env, {
          from: env.BOOKING_CONFIRMATION_FROM_EMAIL || env.BOOKING_FROM_EMAIL,
          to: [payload.fields.email],
          subject: `Ray Leo's received your booking request`,
          text: buildConfirmationText(payload, submissionId),
          html: buildConfirmationHtml(payload, submissionId)
        });
      }

      return jsonResponse(request, env, {
        success: true,
        message: 'Booking request sent. Keep a copy for your records.',
        submissionId
      });
    } catch (error) {
      const status = error.status || 500;
      const message = status >= 500 ? 'The booking request could not be sent right now. Please copy the request or use the email fallback.' : error.message;
      return jsonResponse(request, env, { success: false, message }, status);
    }
  }
};

function normalizePayload(body) {
  const source = typeof body?.source === 'string' ? body.source : 'RayLeos booking form';
  const sourcePath = typeof body?.sourcePath === 'string' ? body.sourcePath : '';
  const userAgent = typeof body?.userAgent === 'string' ? body.userAgent.slice(0, 500) : '';
  const rawFields = body?.fields && typeof body.fields === 'object' ? body.fields : {};
  const fields = {};
  Object.keys(FIELD_LABELS).forEach(key => {
    fields[key] = typeof rawFields[key] === 'string' ? rawFields[key].trim() : '';
  });
  return { source, sourcePath, userAgent, fields };
}

function validatePayload(payload) {
  const errors = {};
  REQUIRED_FIELDS.forEach(key => {
    if (!payload.fields[key]) errors[key] = `${FIELD_LABELS[key]} is required.`;
  });
  if (payload.fields.email && !isEmail(payload.fields.email)) {
    errors.email = 'Enter a valid email address.';
  }
  URL_FIELDS.forEach(key => {
    if (payload.fields[key] && !isHttpUrl(payload.fields[key])) errors[key] = `${FIELD_LABELS[key]} must be a full http or https URL.`;
  });
  if (payload.fields.epkStatus === EPK_WITH_LINK && !payload.fields.epk) {
    errors.epk = 'EPK link is required when EPK status says a press kit link is available.';
  }
  if (payload.fields.epkStatus && payload.fields.epkStatus !== EPK_WITH_LINK && !isNoEpkStatus(payload.fields.epkStatus)) {
    errors.epkStatus = 'Choose a supported EPK status.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

function isNoEpkStatus(value) {
  const normalized = String(value || '').toLowerCase();
  return normalized.includes('full epk yet') || normalized.includes('not sure what an epk is');
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname) && url.hostname.includes('.');
  } catch {
    return false;
  }
}

function buildSubject(fields) {
  const artist = fields.artistName || 'Unknown Artist';
  const dateOrType = fields.selectedDate || fields.preferredDates || fields.requestType || 'Booking Request';
  return `Booking Request: ${artist} - ${dateOrType}`;
}

function buildTextEmail(payload, submissionId) {
  const lines = [`New booking request from Ray Leo's at Lamasco.`, `Submission ID: ${submissionId}`, ''];
  FIELD_SECTIONS.forEach(([title, keys]) => {
    lines.push(title);
    keys.forEach(key => {
      const value = payload.fields[key];
      if (value) lines.push(`${FIELD_LABELS[key]}: ${value}`);
    });
    lines.push('');
  });
  lines.push('Metadata');
  lines.push(`Source: ${payload.source}`);
  if (payload.sourcePath) lines.push(`Source Path: ${payload.sourcePath}`);
  if (payload.userAgent) lines.push(`User Agent: ${payload.userAgent}`);
  return lines.join('\n');
}

function buildHtmlEmail(payload, submissionId) {
  const sections = FIELD_SECTIONS.map(([title, keys]) => renderSection(title, keys, payload.fields)).join('');
  return `<!doctype html><html><body style="margin:0;background:#070707;color:#f5f0e1;font-family:Arial,sans-serif;">
    <div style="max-width:760px;margin:0 auto;padding:24px;background:#111;">
      <h1 style="margin:0 0 8px;color:#f6b51d;text-transform:uppercase;">Ray Leo's Booking Request</h1>
      <p style="color:#d9d0bd;margin:0 0 18px;">Submission ID: ${escapeHTML(submissionId)}</p>
      ${sections}
      <div style="border:1px solid #333;background:#080808;border-radius:12px;padding:16px;margin-top:16px;">
        <h2 style="color:#00a0a0;margin:0 0 8px;">Metadata</h2>
        <p style="margin:4px 0;color:#d9d0bd;"><strong>Source:</strong> ${escapeHTML(payload.source)}</p>
        ${payload.sourcePath ? `<p style="margin:4px 0;color:#d9d0bd;"><strong>Source Path:</strong> ${escapeHTML(payload.sourcePath)}</p>` : ''}
        ${payload.userAgent ? `<p style="margin:4px 0;color:#d9d0bd;"><strong>User Agent:</strong> ${escapeHTML(payload.userAgent)}</p>` : ''}
      </div>
    </div>
  </body></html>`;
}

function buildConfirmationText(payload, submissionId) {
  return [
    `Thanks for sending a booking request to Ray Leo's at Lamasco.`,
    `Submission ID: ${submissionId}`,
    '',
    `This confirms we received your request. It does not guarantee booking. The booking team will review the details and follow up if the date or bill looks like a fit.`,
    '',
    buildTextEmail(payload, submissionId)
  ].join('\n');
}

function buildConfirmationHtml(payload, submissionId) {
  return `<!doctype html><html><body style="margin:0;background:#070707;color:#f5f0e1;font-family:Arial,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:24px;background:#111;">
      <h1 style="margin:0 0 8px;color:#f6b51d;text-transform:uppercase;">Booking request received</h1>
      <p style="color:#d9d0bd;">Thanks for sending a booking request to Ray Leo's at Lamasco. This does not guarantee booking; the booking team will review the details and follow up if the date or bill looks like a fit.</p>
      <p style="color:#00a0a0;"><strong>Submission ID:</strong> ${escapeHTML(submissionId)}</p>
      ${FIELD_SECTIONS.map(([title, keys]) => renderSection(title, keys, payload.fields)).join('')}
    </div>
  </body></html>`;
}

function renderSection(title, keys, fields) {
  const rows = keys
    .filter(key => fields[key])
    .map(key => `<tr><th style="text-align:left;vertical-align:top;color:#f6b51d;padding:7px 10px;border-bottom:1px solid #2b2b2b;width:34%;">${escapeHTML(FIELD_LABELS[key])}</th><td style="color:#f5f0e1;padding:7px 10px;border-bottom:1px solid #2b2b2b;">${escapeHTML(fields[key])}</td></tr>`)
    .join('');
  if (!rows) return '';
  return `<div style="border:1px solid #333;background:#080808;border-radius:12px;padding:16px;margin:0 0 16px;">
    <h2 style="color:#d72819;margin:0 0 8px;text-transform:uppercase;">${escapeHTML(title)}</h2>
    <table role="presentation" style="border-collapse:collapse;width:100%;">${rows}</table>
  </div>`;
}

async function sendResendEmail(env, message) {
  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || 'Email provider rejected the request.');
    error.status = 502;
    throw error;
  }
  return result;
}

function optionsResponse(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request, env),
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = parseList(env.ALLOWED_ORIGINS);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || 'https://rayleos.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

function assertEnv(env) {
  ['RESEND_API_KEY', 'BOOKING_TO_EMAIL', 'BOOKING_FROM_EMAIL'].forEach(key => {
    if (!env[key]) {
      const error = new Error(`${key} is not configured.`);
      error.status = 500;
      throw error;
    }
  });
}

function parseCcEmails(value, excludedEmails = []) {
  if (isBlankListValue(value)) return [];

  const excluded = new Set(excludedEmails.map(normalizeEmail).filter(Boolean));
  const seen = new Set();
  return parseList(value).reduce((emails, item) => {
    const normalized = normalizeEmail(item);
    if (!normalized || excluded.has(normalized) || seen.has(normalized) || !isEmail(normalized)) return emails;
    seen.add(normalized);
    emails.push(item.trim());
    return emails;
  }, []);
}

function isBlankListValue(value) {
  const normalized = normalizeEmail(value);
  return !normalized || ['none', 'null', 'false'].includes(normalized);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function parseList(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function truthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}
