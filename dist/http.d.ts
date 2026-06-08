import type { HydrawiseConfig } from './types';
export interface HttpClient {
    get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T>;
}
export declare function createHttpClient(config: HydrawiseConfig): HttpClient;
//# sourceMappingURL=http.d.ts.map