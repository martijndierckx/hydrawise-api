import { vi } from 'vitest';

export interface FetchCall {
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
}

export function setupFetchMock(reply: unknown) {
  const calls: FetchCall[] = [];
  const fetchFn = vi.fn(async (url: string, init?: { headers?: Record<string, string> }) => {
    const u = new URL(url);
    const params: Record<string, string> = {};
    u.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    calls.push({ url, headers: init?.headers ?? {}, params });
    return new Response(JSON.stringify(reply), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchFn);
  return { calls };
}

export function restoreFetchMock() {
  vi.unstubAllGlobals();
}
