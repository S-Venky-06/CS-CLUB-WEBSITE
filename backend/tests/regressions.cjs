const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Tests never read real service credentials or send external requests.
Object.assign(process.env, { NODE_ENV: 'test', SESSION_SECRET: 'test-only-secret-with-at-least-32-characters',
  GOOGLE_SERVICE_ACCOUNT: '', GOOGLE_SPREADSHEET_ID: '', BREVO_API_KEY: '',
  CASHFREE_APP_ID: '', CASHFREE_SECRET_KEY: '', ADMIN_EMAILS: '', SUPER_ADMIN_EMAILS: '' });
const sheetsClient = require('../dist/repositories/googleSheets.client.js');
const writes = [];
let memberRole = 'admin';
let eventRows = [];
sheetsClient.getSheetsClient = () => ({ spreadsheets: {
  get: async () => ({ data: {} }),
  values: {
    get: async ({ range }) => ({ data: { values: range.startsWith('Members!')
      ? [['admin@example.test', 'Admin', memberRole, 'TRUE', '0']]
      : range.startsWith('Events!') ? eventRows : [] } }),
    append: async (request) => { writes.push(request); return { data: {} }; },
    update: async (request) => { writes.push(request); return { data: {} }; },
  },
} });
const { generateToken, verifyToken } = require('../dist/utils/token.js');
const { parseRegistrationRow } = require('../dist/repositories/registrationRow.js');
const { eventRegistrationSchema } = require('../dist/validators/registration.schema.js');
const { validate } = require('../dist/validators/validate.js');
const { registerForEvent } = require('../dist/services/registration.service.js');
const { escapeHtml } = require('../dist/utils/escapeHtml.js');
const app = require('../dist/app.js').default;
const user = { email: 'admin@example.test', name: 'Admin', picture: '', role: 'admin', loginAt: new Date().toISOString() };
let server;
let base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(() => new Promise(resolve => server.close(resolve)));
const call = (path, body, token = generateToken(user)) => fetch(base + path, {
  method: body === undefined ? 'GET' : 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

test('tokens reject tampering, malformed users, expiration, and future login times', () => {
  const token = generateToken(user);
  assert.deepEqual(verifyToken(token), user);
  assert.equal(verifyToken(token + 'x'), null);
  for (const payload of [{ ...user, role: 'owner' }, { ...user, loginAt: 'invalid' },
    { ...user, loginAt: new Date(Date.now() - 86400001).toISOString() },
    { ...user, loginAt: new Date(Date.now() + 60000).toISOString() }]) {
    assert.equal(verifyToken(generateToken(payload)), null);
  }
});

test('invalid bearer cannot reuse an authenticated session cookie', async () => {
  const response = await call('/auth/me');
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  const rejected = await fetch(base + '/auth/me', { headers: { Cookie: cookie, Authorization: 'Bearer invalid' } });
  assert.equal(rejected.status, 401);
});

test('old admin token loses access when member role is demoted or unknown', async () => {
  for (const role of ['member', 'owner', 'toString', '__proto__']) {
    memberRole = role;
    assert.equal((await call('/admin/events')).status, 403);
  }
  memberRole = 'admin';
  assert.equal((await call('/admin/events')).status, 200);
});

test('new event persists its location', async () => {
  writes.length = 0;
  const response = await call('/admin/events', { eventId: 'test-event', title: 'Test event',
    description: 'Regression test event', date: '2030-01-02T10:00:00Z', deadline: '2030-01-01T10:00:00Z',
    capacity: 20, status: 'active', price: 0, location: 'Lab 42' });
  assert.equal(response.status, 201);
  assert.equal(writes.find(write => write.range === 'Events!A2:I2').requestBody.values[0][7], 'Lab 42');
});

test('request schemas apply defaults and discard unknown input', () => {
  const body = { eventId: 'event', phone: '1234567890', year: '2', section: 'A', branch: 'CSE', rollNumber: 'R1', injected: true };
  const req = { body };
  let passed = false;
  validate(eventRegistrationSchema)(req, {}, () => { passed = true; });
  assert.equal(passed, true);
  assert.equal(req.body.teamSize, 1);
  assert.deepEqual(req.body.teamMembers, []);
  assert.equal(req.body.injected, undefined);
  for (const teamSize of [0, -1, 1.5, 5, 2]) {
    assert.equal(eventRegistrationSchema.safeParse({ ...body, teamSize }).success, false);
  }
  const member = { name: 'Member', email: 'member@example.test', phone: '1234567890', rollNumber: ' r1 ', branch: 'CSE', section: 'A' };
  assert.equal(eventRegistrationSchema.safeParse({ ...body, teamSize: 2, teamMembers: [member] }).success, false);
});

test('malformed cells are isolated, email status survives and legacy attendance is preserved', () => {
  const row = ['REG1', 'evt', 'a@example.test', 'A', '', 1234567890, '2', 'A', 'CSE', 'R1', '', 'TRUE', 'FREE', '', 'NaN', '{broken', 'SENT'];
  const reg = parseRegistrationRow(row);
  assert.deepEqual(reg.teamMembers, []);
  assert.deepEqual(reg.attendedMembers, ['R1']);
  assert.equal(reg.emailStatus, 'SENT');
  assert.equal(reg.phone, '1234567890');
  assert.equal(reg.teamSize, 1);
  row[11] = '{}'; row[15] = '[null, 1, {}]';
  assert.deepEqual(parseRegistrationRow(row).attendedMembers, []);
  assert.deepEqual(parseRegistrationRow(row).teamMembers, []);
});

test('bad JSON and oversized requests return client errors', async () => {
  for (const [body, status] of [['{broken', 400], [JSON.stringify({ data: 'x'.repeat(11000) }), 413]]) {
    const response = await fetch(base + '/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    assert.equal(response.status, status);
    assert.equal((await response.json()).success, false);
  }
});

test('unlisted Vercel lookalike origin is denied', async () => {
  const response = await fetch(base + '/health', { headers: { Origin: 'https://cs-club-website-attacker.vercel.app' } });
  assert.equal(response.status, 403);
});

test('legacy registration rejects paid events and preserves free team details', async () => {
  eventRows = [['team-event', 'Team Event', 'An event', '2030-01-02T10:00:00Z', '100', '2030-01-01T10:00:00Z', 'active', 'Lab', '50']];
  const args = ['team-event', 'LEADER@example.test', 'Leader', '', '1234567890', '2', 'A', 'CSE', 'R1'];
  await assert.rejects(registerForEvent(...args), /payment checkout/);
  eventRows[0][8] = '0';
  const member = { name: 'Member', email: 'member@example.test', phone: '1234567890', rollNumber: 'R2', branch: 'CSE', section: 'A' };
  const reg = await registerForEvent(...args, '', '', '', '', '', 2, [member]);
  assert.equal(reg.paymentStatus, 'FREE');
  assert.equal(reg.email, 'leader@example.test');
  assert.equal(reg.teamSize, 2);
  assert.deepEqual(reg.teamMembers, [member]);
  eventRows = [];
});

test('confirmation email text cannot inject HTML', () => {
  assert.equal(escapeHtml('<img src=x> & "quoted"'), '&lt;img src=x&gt; &amp; &quot;quoted&quot;');
});

test('admin input rejects string booleans, unknown roles, and duplicate attendance', async () => {
  memberRole = 'super_admin';
  const response = await call('/admin/members', { email: 'new@example.test', name: 'New', role: 'owner' });
  assert.equal(response.status, 422);
  for (const [path, method, body] of [
    ['/admin/settings', 'PATCH', { registrationOpen: 'false' }],
    ['/admin/announcements/ANN-1/active', 'PATCH', { active: 'false' }],
    ['/admin/registrations/REG-1/attendance', 'PUT', { attendedMembers: ['R1', 'R1'] }],
  ]) {
    const result = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${generateToken(user)}` }, body: JSON.stringify(body) });
    assert.equal(result.status, 422);
  }
  memberRole = 'admin';
});
