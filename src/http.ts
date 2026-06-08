import { HydrawiseCommandException } from './HydrawiseCommandException';
import type { HydrawiseConfig } from './types';

export interface HttpClient {
  get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T>;
}

export function createHttpClient(config: HydrawiseConfig): HttpClient {
  const baseURL = config.type === 'LOCAL' ? `http://${config.host}/` : 'https://app.hydrawise.com/api/v1/';
  const headers: Record<string, string> = {};
  const defaultParams: Record<string, string> = {};

  if (config.type === 'LOCAL') {
    const creds = Buffer.from(`${config.user ?? 'admin'}:${config.password}`).toString('base64');
    headers['Authorization'] = `Basic ${creds}`;
  } else {
    defaultParams['api_key'] = config.key;
  }

  return {
    async get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
      const search = new URLSearchParams(defaultParams);
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) search.append(k, String(v));
      }
      const url = `${baseURL}${path}?${search.toString()}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${path}`);
      }
      const data = (await res.json()) as T & { messageType?: string; message?: string };
      if (data.messageType === 'error') {
        throw new HydrawiseCommandException(data.message ?? 'Unknown Hydrawise error');
      }
      return data;
    }
  };
}
