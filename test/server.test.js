import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createWinnieServer } from '../server.js';

async function startServer() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'winnie-test-'));
  const databasePath = path.join(directory, 'winnie.db');
  const server = createWinnieServer({ adminId: 'Root Admin', adminPassword: 'secret-pass', databasePath });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    baseUrl,
    databasePath,
    async close() {
      await new Promise(resolve => server.close(resolve));
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
}

function cookieFrom(response) {
  return response.headers.get('set-cookie')?.split(';')[0] || '';
}

async function postJson(baseUrl, pathname, body, cookie = '') {
  return fetch(baseUrl + pathname, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
}

test('required administrator configuration is validated', () => {
  assert.throws(() => createWinnieServer({ adminId: '', adminPassword: 'x', databasePath: ':memory:' }), /WINNIE_ADMIN_ID/);
  assert.throws(() => createWinnieServer({ adminId: 'x', adminPassword: '', databasePath: ':memory:' }), /WINNIE_ADMIN_PASSWORD/);
});

test('managed ID authentication, authorization, deletion, and persistence', async t => {
  const app = await startServer();
  t.after(() => app.close());

  const anonymousApp = await fetch(app.baseUrl + '/', { redirect: 'manual' });
  assert.equal(anonymousApp.status, 200);
  assert.match(await anonymousApp.text(), /id="loginForm"/);
  const legacyLogin = await fetch(app.baseUrl + '/login', { redirect: 'manual' });
  assert.equal(legacyLogin.status, 302);
  assert.equal(legacyLogin.headers.get('location'), '/');
  const protectedAsset = await fetch(app.baseUrl + '/default_background.jpg', { redirect: 'manual' });
  assert.equal(protectedAsset.status, 302);
  assert.equal(protectedAsset.headers.get('location'), '/');
  assert.equal((await postJson(app.baseUrl, '/auth/login', { id: 'missing' })).status, 401);

  const adminLogin = await postJson(app.baseUrl, '/auth/admin-login', { id: ' root ADMIN ', password: 'secret-pass' });
  assert.equal(adminLogin.status, 204);
  const adminCookie = cookieFrom(adminLogin);
  assert.match(adminLogin.headers.get('set-cookie'), /HttpOnly/);
  assert.match(adminLogin.headers.get('set-cookie'), /SameSite=Strict/);

  const created = await postJson(app.baseUrl, '/api/admin/ids', { id: ' Nurse-007 ' }, adminCookie);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).id, 'Nurse-007');
  assert.equal((await postJson(app.baseUrl, '/api/admin/ids', { id: 'nurse-007' }, adminCookie)).status, 409);

  const list = await fetch(app.baseUrl + '/api/admin/ids', { headers: { Cookie: adminCookie } });
  assert.deepEqual((await list.json()).ids.map(item => item.id), ['Nurse-007']);

  const userLogin = await postJson(app.baseUrl, '/auth/login', { id: '  NURSE-007  ' });
  assert.equal(userLogin.status, 204);
  const userCookie = cookieFrom(userLogin);
  assert.equal((await fetch(app.baseUrl + '/', { headers: { Cookie: userCookie } })).status, 200);
  assert.equal((await fetch(app.baseUrl + '/api/admin/ids', { headers: { Cookie: userCookie } })).status, 403);
  assert.equal((await fetch(app.baseUrl + '/admin', { headers: { Cookie: userCookie } })).status, 403);

  const deleted = await fetch(app.baseUrl + '/api/admin/ids/' + encodeURIComponent('Nurse-007'), { method: 'DELETE', headers: { Cookie: adminCookie } });
  assert.equal(deleted.status, 204);
  assert.equal((await fetch(app.baseUrl + '/auth/status', { headers: { Cookie: userCookie } })).status, 401);
  assert.equal((await postJson(app.baseUrl, '/auth/login', { id: 'nurse-007' })).status, 401);
});

test('created IDs persist in SQLite across server restarts', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'winnie-persist-'));
  const databasePath = path.join(directory, 'winnie.db');
  const options = { adminId: 'admin', adminPassword: 'password', databasePath };
  let server = createWinnieServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let baseUrl = `http://127.0.0.1:${server.address().port}`;
  let response = await postJson(baseUrl, '/auth/admin-login', { id: 'admin', password: 'password' });
  const adminCookie = cookieFrom(response);
  response = await postJson(baseUrl, '/api/admin/ids', { id: 'Persistent ID' }, adminCookie);
  assert.equal(response.status, 201);
  await new Promise(resolve => server.close(resolve));

  server = createWinnieServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  response = await postJson(baseUrl, '/auth/login', { id: 'persistent id' });
  assert.equal(response.status, 204);
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('login attempts are throttled after five failures', async t => {
  const app = await startServer();
  t.after(() => app.close());
  for (let attempt = 1; attempt <= 4; attempt++) {
    assert.equal((await postJson(app.baseUrl, '/auth/login', { id: 'wrong' })).status, 401);
  }
  assert.equal((await postJson(app.baseUrl, '/auth/login', { id: 'wrong' })).status, 401);
  const blocked = await postJson(app.baseUrl, '/auth/login', { id: 'wrong' });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('retry-after'), '900');
  assert.deepEqual(await blocked.json(), { error: 'ID Not Found' });
});
