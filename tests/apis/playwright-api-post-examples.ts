import { test, expect, APIRequestContext, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ============================================================
// 1. CONTEXT-LEVEL SETUP (playwright.config.ts equivalent)
//    Auth, base URL, and default headers go here — not per-request
// ============================================================

let apiContext: APIRequestContext;

test.beforeAll(async () => {
  apiContext = await request.newContext({
    baseURL: 'https://api.example.com',
    extraHTTPHeaders: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      'x-api-key':   process.env.API_KEY ?? '',
    },
    // Restore cookies/storage from a saved login state
    storageState: 'auth.json',     // optional
    ignoreHTTPSErrors: false,      // set true for self-signed certs in staging
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});


// ============================================================
// 2. HEADERS — per-request override
// ============================================================

test('POST with custom headers', async () => {
  const response = await apiContext.post('/users', {
    headers: {
      'Content-Type':   'application/json',
      Accept:           'application/json',
      'X-Request-Id':   'abc-123',
      'Accept-Language':'en-US',
      'Cache-Control':  'no-cache',
      // Authorization is already set at context level — override if needed:
      // Authorization: `Bearer ${otherToken}`,
    },
    data: { name: 'Alice' },
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  console.log('Created user:', body);
});


// ============================================================
// 3. BODY — data (JSON / string / Buffer)
// ============================================================

test('POST with JSON object (auto Content-Type)', async () => {
  const response = await apiContext.post('/login', {
    data: {
      username: 'alice',
      password: 'secret',
      rememberMe: true,
    },
    // Playwright auto-sets Content-Type: application/json
  });

  expect(response.ok()).toBeTruthy();
  const { token } = await response.json();
  console.log('Token:', token);
});

test('POST with raw JSON string', async () => {
  const payload = JSON.stringify({ key: 'value', nested: { a: 1 } });

  const response = await apiContext.post('/raw', {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });

  expect(response.status()).toBe(200);
});

test('POST with binary Buffer', async () => {
  const binaryData = Buffer.from('binary content here');

  const response = await apiContext.post('/binary', {
    data: binaryData,
    headers: { 'Content-Type': 'application/octet-stream' },
  });

  expect(response.status()).toBe(200);
});


// ============================================================
// 4. FORM — application/x-www-form-urlencoded
// ============================================================

test('POST with URL-encoded form data', async () => {
  const response = await apiContext.post('/submit', {
    form: {
      username: 'alice',
      age:      30,
      active:   true,
      role:     'admin',
    },
    // Playwright auto-sets Content-Type: application/x-www-form-urlencoded
  });

  expect(response.ok()).toBeTruthy();
});


// ============================================================
// 5. MULTIPART — file uploads
// ============================================================

test('POST multipart with ReadStream (file path)', async () => {
  const response = await apiContext.post('/upload', {
    multipart: {
      file:        fs.createReadStream(path.join(__dirname, 'fixtures/report.pdf')),
      description: 'Q3 report',
      userId:      42,
      isPublic:    false,
    },
    // Playwright auto-sets Content-Type: multipart/form-data with correct boundary
  });

  expect(response.status()).toBe(200);
  const result = await response.json();
  console.log('Uploaded file ID:', result.fileId);
});

test('POST multipart with Buffer + explicit metadata', async () => {
  const fileBuffer = fs.readFileSync(path.join(__dirname, 'fixtures/photo.png'));

  const response = await apiContext.post('/upload', {
    multipart: {
      file: {
        name:     'photo.png',
        mimeType: 'image/png',
        buffer:   fileBuffer,
      },
      tag:    'profile',
      userId: 7,
    },
  });

  expect(response.ok()).toBeTruthy();
});

test('POST multipart with multiple files', async () => {
  const response = await apiContext.post('/upload/bulk', {
    multipart: {
      file1: {
        name:     'doc1.pdf',
        mimeType: 'application/pdf',
        buffer:   fs.readFileSync('fixtures/doc1.pdf'),
      },
      file2: {
        name:     'doc2.pdf',
        mimeType: 'application/pdf',
        buffer:   fs.readFileSync('fixtures/doc2.pdf'),
      },
      label: 'batch-upload',
    },
  });

  expect(response.status()).toBe(201);
});


// ============================================================
// 6. PARAMS — query string parameters
// ============================================================

test('POST with query params', async () => {
  // Results in: /search?page=1&size=20&active=true&filter=admins
  const response = await apiContext.post('/search', {
    params: {
      page:   1,
      size:   20,
      active: true,
      filter: 'admins',
    },
    data: { query: 'alice' },
  });

  expect(response.ok()).toBeTruthy();
  const { results } = await response.json();
  console.log('Search results:', results);
});


// ============================================================
// 7. TIMEOUT — per-request override (default: 30 000 ms)
// ============================================================

test('POST with custom timeout for slow endpoint', async () => {
  const response = await apiContext.post('/jobs/run', {
    data:    { jobId: 'heavy-etl-job' },
    timeout: 120_000, // 2 minutes
  });

  expect(response.ok()).toBeTruthy();
});


// ============================================================
// 8. maxRedirects — control redirect behaviour
// ============================================================

test('POST capturing raw 3xx response (no redirect)', async () => {
  const response = await apiContext.post('/redirect-endpoint', {
    data:         { id: 1 },
    maxRedirects: 0, // do NOT follow — capture the Location header
  });

  expect(response.status()).toBe(302);
  console.log('Redirect to:', response.headers()['location']);
});

test('POST following a limited number of redirects', async () => {
  const response = await apiContext.post('/may-redirect', {
    data:         { id: 2 },
    maxRedirects: 2, // follow at most 2 hops
  });

  expect(response.ok()).toBeTruthy();
});


// ============================================================
// 9. failOnStatusCode — throw on 4xx / 5xx
// ============================================================

test('POST that throws on non-2xx response', async () => {
  // Without failOnStatusCode, Playwright returns the response regardless of status.
  // With it set to true, an error is thrown for 4xx/5xx.
  const response = await apiContext.post('/create', {
    data:             { name: 'Test' },
    failOnStatusCode: true, // throws if status >= 400
  });

  // Reaches here only if status is 2xx/3xx
  expect(response.status()).toBe(201);
});

test('POST handling 4xx manually (failOnStatusCode: false — default)', async () => {
  const response = await apiContext.post('/create', {
    data: { name: '' }, // server returns 400 for empty name
    // failOnStatusCode defaults to false — we inspect the response ourselves
  });

  expect(response.status()).toBe(400);
  const error = await response.json();
  console.log('Validation error:', error.message);
});


// ============================================================
// 10. ignoreHTTPSErrors — self-signed / invalid certs
// ============================================================

test('POST against staging with self-signed cert', async () => {
  // Create a one-off context for this specific host
  const stagingContext = await request.newContext({
    baseURL:           'https://staging.internal',
    ignoreHTTPSErrors: true,
    extraHTTPHeaders:  { Authorization: `Bearer ${process.env.STAGING_TOKEN}` },
  });

  const response = await stagingContext.post('/api/data', {
    data: { id: 99 },
  });

  expect(response.ok()).toBeTruthy();
  await stagingContext.dispose();
});


// ============================================================
// 11. COMBINING OPTIONS — real-world example
// ============================================================

test('POST — all options combined', async () => {
  const response = await apiContext.post('/reports/generate', {
    // Query params
    params: { version: 2, async: false },

    // Request body
    data: {
      reportType: 'monthly',
      from:       '2024-01-01',
      to:         '2024-01-31',
    },

    // Per-request headers (merged with context-level headers)
    headers: {
      'X-Correlation-Id': 'req-xyz-789',
      Accept:             'application/json',
    },

    timeout:          60_000,   // 60 s for a heavy report
    failOnStatusCode: true,     // throw on 4xx/5xx
    maxRedirects:     5,
    ignoreHTTPSErrors: false,
  });

  const report = await response.json();
  console.log('Report ID:', report.id);
  expect(report).toHaveProperty('id');
});


// ============================================================
// 12. RESPONSE HELPERS — what you can do with the response
// ============================================================

test('Reading the response', async () => {
  const response = await apiContext.post('/users', {
    data: { name: 'Bob' },
  });

  // Status
  console.log(response.status());       // 201
  console.log(response.statusText());   // 'Created'
  console.log(response.ok());           // true if 200–299

  // Headers
  const headers = response.headers();
  console.log(headers['content-type']); // 'application/json'

  // Body — pick ONE
  const json   = await response.json();    // parsed JSON
  const text   = await response.text();    // raw string
  const buffer = await response.body();    // Buffer (for binary)

  expect(json).toHaveProperty('id');
});
