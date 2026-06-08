import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHttpClient } from '../src/http';
import { HydrawiseCommandException } from '../src/HydrawiseCommandException';

describe('createHttpClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('LOCAL: sets Authorization: Basic <base64(user:password)> and no api_key', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const http = createHttpClient({ type: 'LOCAL', host: '192.168.1.10', password: 'pw' });
    await http.get('get_sched_json.php');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/^http:\/\/192\.168\.1\.10\/get_sched_json\.php\?/);
    expect(url).not.toMatch(/api_key/);
    const expectedAuth = Buffer.from('admin:pw').toString('base64');
    expect(init.headers.Authorization).toBe(`Basic ${expectedAuth}`);
  });

  it('LOCAL: honors custom user', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    const http = createHttpClient({ type: 'LOCAL', host: 'h', password: 'p', user: 'root' });
    await http.get('x.php');
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers.Authorization).toBe(`Basic ${Buffer.from('root:p').toString('base64')}`);
  });

  it('CLOUD: adds api_key as query param and no Authorization', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    const http = createHttpClient({ type: 'CLOUD', key: 'secret-key' });
    await http.get('statusschedule.php');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/^https:\/\/app\.hydrawise\.com\/api\/v1\/statusschedule\.php\?/);
    expect(url).toContain('api_key=secret-key');
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('appends additional params after defaults', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    const http = createHttpClient({ type: 'CLOUD', key: 'k' });
    await http.get('statusschedule.php', { controller_id: 5001 });
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('api_key=k');
    expect(url).toContain('controller_id=5001');
  });

  it('omits undefined params', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    const http = createHttpClient({ type: 'CLOUD', key: 'k' });
    await http.get('x.php', { controller_id: undefined, foo: 'bar' });
    const url = fetchMock.mock.calls[0][0];
    expect(url).not.toContain('controller_id');
    expect(url).toContain('foo=bar');
  });

  it('throws HydrawiseCommandException when messageType=="error"', async () => {
    fetchMock.mockImplementation(
      () => Promise.resolve(new Response(JSON.stringify({ messageType: 'error', message: 'Invalid API Key.' }), { status: 200 }))
    );
    const http = createHttpClient({ type: 'CLOUD', key: 'bad' });
    await expect(http.get('x.php')).rejects.toThrow(HydrawiseCommandException);
    await expect(http.get('x.php')).rejects.toThrow('Invalid API Key.');
  });

  it('throws on non-2xx HTTP status', async () => {
    fetchMock.mockResolvedValue(new Response('Forbidden', { status: 403, statusText: 'Forbidden' }));
    const http = createHttpClient({ type: 'CLOUD', key: 'k' });
    await expect(http.get('x.php')).rejects.toThrow(/HTTP 403/);
  });
});
