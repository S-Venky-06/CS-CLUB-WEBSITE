import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch, API_URL } from '../../frontend/src/lib/api.ts';
import { csvCell } from '../../frontend/src/lib/csv.ts';
import { toLocalDateTime } from '../../frontend/src/lib/date.ts';

test('editing an event preserves its instant in a non-UTC timezone', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'Asia/Kolkata';
  try {
    const stored = '2030-01-02T10:00:00.000Z';
    assert.equal(toLocalDateTime(stored), '2030-01-02T15:30');
    assert.equal(new Date(toLocalDateTime(stored)).toISOString(), stored);
    assert.equal(toLocalDateTime('invalid'), '');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('CSV handles quotes, numeric cells, formula prefixes, and URL fragments', () => {
  assert.equal(csvCell('Name "Quoted", #1'), '"Name ""Quoted"", #1"');
  assert.equal(csvCell(42), '"42"');
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell(' @SUM(1,2)'), '"\' @SUM(1,2)"');
});

test('API helper attaches token immediately, preserves Request headers, and excludes lookalike origins', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let received: RequestInit | undefined;
  globalThis.fetch = async (_input, init) => { received = init; return new Response('{}'); };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { getItem: () => 'test-token' } } });
  try {
    await apiFetch(new Request(`${API_URL}/api/v1/auth/me`, { headers: { 'X-Test': 'preserved' } }));
    assert.equal(new Headers(received?.headers).get('Authorization'), 'Bearer test-token');
    assert.equal(new Headers(received?.headers).get('X-Test'), 'preserved');
    await apiFetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: 'Bearer explicit' } });
    assert.equal(new Headers(received?.headers).get('Authorization'), 'Bearer explicit');
    await apiFetch('https://example.invalid/api/v1/auth/me');
    assert.equal(received, undefined);
    await apiFetch(`${API_URL}/api-evil/auth/me`);
    assert.equal(received, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
