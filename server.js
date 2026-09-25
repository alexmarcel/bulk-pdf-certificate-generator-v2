import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const COOKIE_NAME = 'winnie_session';
const MAX_BODY_BYTES = 16 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function normalizeId(value) {
  return typeof value === 'string' ? value.trim().toLocaleLowerCase('en-US') : '';
}

function timingSafeTextEqual(left, right) {
  const leftHash = crypto.createHash('sha256').update(String(left)).digest();
  const rightHash = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

function sendJson(res, status, payload, headers = {}) {
  const body = payload === null ? '' : JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, 'Cache-Control': 'no-store' });
  res.end();
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Invalid JSON');
    error.statusCode = 400;
    throw error;
  }
}

function requestIp(req) {
  return req.socket.remoteAddress || 'unknown';
}

function isHttps(req) {
  return Boolean(req.socket.encrypted) || req.headers['x-forwarded-proto']?.split(',')[0].trim() === 'https';
}

function sessionCookie(token, req) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict${isHttps(req) ? '; Secure' : ''}`;
}

function clearSessionCookie(req) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isHttps(req) ? '; Secure' : ''}`;
}

function publicAssetPath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const relative = decoded.replace(/^\/+/, '').replaceAll('\\', '/');
  if (!relative || relative.includes('..') || relative.startsWith('.')) return null;
  const allowedRootFiles = new Set([
    'index.html',
    'documentation.html',
    'default_background.jpg',
    'namelist.txt',
    'stafflist-custom-field.csv',
  ]);
  if (!allowedRootFiles.has(relative) && !relative.startsWith('template/')) return null;
  const absolute = path.resolve(ROOT, relative);
  if (!absolute.startsWith(ROOT + path.sep)) return null;
  return absolute;
}

function serveFile(res, filePath, method = 'GET') {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }
  if (!stat.isFile()) {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Content-Length': stat.size,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Cache-Control': path.extname(filePath) === '.html' ? 'no-store' : 'private, max-age=300',
  });
  if (method === 'HEAD') res.end();
  else fs.createReadStream(filePath).pipe(res);
}

export function createWinnieServer(options = {}) {
  const adminId = options.adminId ?? process.env.WINNIE_ADMIN_ID;
  const adminPassword = options.adminPassword ?? process.env.WINNIE_ADMIN_PASSWORD;
  const databasePath = options.databasePath ?? process.env.WINNIE_DB_PATH ?? '/data/winnie.db';

  if (!adminId?.trim()) throw new Error('WINNIE_ADMIN_ID is required');
  if (!adminPassword) throw new Error('WINNIE_ADMIN_PASSWORD is required');

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS access_ids (
      normalized_id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT;
  `);

  const listIds = db.prepare('SELECT display_id AS id, created_at AS createdAt FROM access_ids ORDER BY display_id COLLATE NOCASE');
  const findId = db.prepare('SELECT display_id AS id FROM access_ids WHERE normalized_id = ?');
  const insertId = db.prepare('INSERT INTO access_ids (normalized_id, display_id, created_at) VALUES (?, ?, ?)');
  const deleteId = db.prepare('DELETE FROM access_ids WHERE normalized_id = ?');
  const sessions = new Map();
  const attempts = new Map();

  function getSession(req) {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    if (!token) return null;
    const session = sessions.get(token);
    if (!session) return null;
    const now = Date.now();
    if (now - session.lastSeen > SESSION_TTL_MS) {
      sessions.delete(token);
      return null;
    }
    session.lastSeen = now;
    return { token, ...session };
  }

  function createSession(role, id) {
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { role, id, lastSeen: Date.now() });
    return token;
  }

  function failureState(ip, scope) {
    const key = `${scope}:${ip}`;
    const now = Date.now();
    let state = attempts.get(key);
    if (!state || now - state.windowStarted >= ATTEMPT_WINDOW_MS) {
      state = { failures: 0, windowStarted: now, blockedUntil: 0 };
      attempts.set(key, state);
    }
    return { key, state, now };
  }

  function isBlocked(ip, scope) {
    const { state, now } = failureState(ip, scope);
    return state.blockedUntil > now;
  }

  function recordFailure(ip, scope) {
    const { state, now } = failureState(ip, scope);
    state.failures += 1;
    if (state.failures >= MAX_FAILURES) state.blockedUntil = now + ATTEMPT_WINDOW_MS;
  }

  function clearFailures(ip, scope) {
    attempts.delete(`${scope}:${ip}`);
  }

  function requireAdmin(req, res) {
    const session = getSession(req);
    if (!session) {
      sendJson(res, 401, { error: 'Authentication required' });
      return null;
    }
    if (session.role !== 'admin') {
      sendJson(res, 403, { error: 'Forbidden' });
      return null;
    }
    return session;
  }

  async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;
    const method = req.method || 'GET';
    const session = getSession(req);

    try {
      if (method === 'POST' && pathname === '/auth/login') {
        const ip = requestIp(req);
        if (isBlocked(ip, 'user')) {
          sendJson(res, 429, { error: 'ID Not Found' }, { 'Retry-After': '900' });
          return;
        }
        const body = await readJson(req);
        const normalized = normalizeId(body.id);
        const found = normalized ? findId.get(normalized) : null;
        if (!found) {
          recordFailure(ip, 'user');
          sendJson(res, 401, { error: 'ID Not Found' });
          return;
        }
        clearFailures(ip, 'user');
        const token = createSession('user', normalized);
        sendJson(res, 204, null, { 'Set-Cookie': sessionCookie(token, req) });
        return;
      }

      if (method === 'POST' && pathname === '/auth/admin-login') {
        const ip = requestIp(req);
        if (isBlocked(ip, 'admin')) {
          sendJson(res, 429, { error: 'Invalid administrator credentials' }, { 'Retry-After': '900' });
          return;
        }
        const body = await readJson(req);
        const idMatches = timingSafeTextEqual(normalizeId(body.id), normalizeId(adminId));
        const passwordMatches = timingSafeTextEqual(body.password ?? '', adminPassword);
        if (!idMatches || !passwordMatches) {
          recordFailure(ip, 'admin');
          sendJson(res, 401, { error: 'Invalid administrator credentials' });
          return;
        }
        clearFailures(ip, 'admin');
        const token = createSession('admin', normalizeId(adminId));
        sendJson(res, 204, null, { 'Set-Cookie': sessionCookie(token, req) });
        return;
      }

      if (method === 'POST' && pathname === '/auth/logout') {
        if (session) sessions.delete(session.token);
        sendJson(res, 204, null, { 'Set-Cookie': clearSessionCookie(req) });
        return;
      }

      if (method === 'GET' && pathname === '/auth/status') {
        if (!session) sendJson(res, 401, { authenticated: false });
        else sendJson(res, 200, { authenticated: true, role: session.role });
        return;
      }

      if (pathname === '/api/admin/ids' && method === 'GET') {
        if (!requireAdmin(req, res)) return;
        sendJson(res, 200, { ids: listIds.all() });
        return;
      }

      if (pathname === '/api/admin/ids' && method === 'POST') {
        if (!requireAdmin(req, res)) return;
        const body = await readJson(req);
        const displayId = typeof body.id === 'string' ? body.id.trim() : '';
        const normalized = normalizeId(displayId);
        if (!normalized || displayId.length > 128) {
          sendJson(res, 400, { error: 'ID must contain between 1 and 128 characters' });
          return;
        }
        try {
          const createdAt = new Date().toISOString();
          insertId.run(normalized, displayId, createdAt);
          sendJson(res, 201, { id: displayId, createdAt });
        } catch (error) {
          if (String(error.message).includes('UNIQUE constraint failed')) sendJson(res, 409, { error: 'ID already exists' });
          else throw error;
        }
        return;
      }

      if (pathname.startsWith('/api/admin/ids/') && method === 'DELETE') {
        if (!requireAdmin(req, res)) return;
        let rawId;
        try {
          rawId = decodeURIComponent(pathname.slice('/api/admin/ids/'.length));
        } catch {
          sendJson(res, 400, { error: 'Invalid ID' });
          return;
        }
        const normalized = normalizeId(rawId);
        const result = deleteId.run(normalized);
        if (!result.changes) {
          sendJson(res, 404, { error: 'ID not found' });
          return;
        }
        for (const [token, activeSession] of sessions) {
          if (activeSession.role === 'user' && activeSession.id === normalized) sessions.delete(token);
        }
        sendJson(res, 204, null);
        return;
      }

      if ((method === 'GET' || method === 'HEAD') && pathname === '/login') {
        if (session?.role === 'user') {
          redirect(res, '/');
          return;
        }
        if (session?.role === 'admin') {
          redirect(res, '/admin');
          return;
        }
        serveFile(res, path.join(ROOT, 'login.html'), method);
        return;
      }

      if ((method === 'GET' || method === 'HEAD') && pathname === '/admin') {
        if (session?.role === 'user') {
          sendJson(res, 403, { error: 'Forbidden' });
          return;
        }
        serveFile(res, path.join(ROOT, 'admin.html'), method);
        return;
      }

      if (method !== 'GET' && method !== 'HEAD') {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }

      if (!session) {
        redirect(res, '/login');
        return;
      }
      if (session.role !== 'user') {
        redirect(res, '/admin');
        return;
      }
      const asset = publicAssetPath(pathname === '/' ? '/index.html' : pathname);
      if (!asset) {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }
      serveFile(res, asset, method);
    } catch (error) {
      console.error(error);
      sendJson(res, error.statusCode || 500, { error: error.statusCode ? error.message : 'Internal server error' });
    }
  }

  const server = http.createServer(handler);
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [token, activeSession] of sessions) {
      if (now - activeSession.lastSeen > SESSION_TTL_MS) sessions.delete(token);
    }
    for (const [key, state] of attempts) {
      if (now - state.windowStarted > ATTEMPT_WINDOW_MS && state.blockedUntil <= now) attempts.delete(key);
    }
  }, 60_000);
  cleanup.unref();
  server.on('close', () => {
    clearInterval(cleanup);
    db.close();
  });
  return server;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const port = Number.parseInt(process.env.PORT || '8080', 10);
  const server = createWinnieServer();
  server.listen(port, '0.0.0.0', () => console.log(`WINNIE listening on port ${port}`));
}
