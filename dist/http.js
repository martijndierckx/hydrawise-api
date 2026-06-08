"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpClient = createHttpClient;
const HydrawiseCommandException_1 = require("./HydrawiseCommandException");
function createHttpClient(config) {
    const baseURL = config.type === 'LOCAL' ? `http://${config.host}/` : 'https://app.hydrawise.com/api/v1/';
    const headers = {};
    const defaultParams = {};
    if (config.type === 'LOCAL') {
        const creds = Buffer.from(`${config.user ?? 'admin'}:${config.password}`).toString('base64');
        headers['Authorization'] = `Basic ${creds}`;
    }
    else {
        defaultParams['api_key'] = config.key;
    }
    return {
        async get(path, params = {}) {
            const search = new URLSearchParams(defaultParams);
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined)
                    search.append(k, String(v));
            }
            const url = `${baseURL}${path}?${search.toString()}`;
            const res = await fetch(url, { headers });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText} for ${path}`);
            }
            const data = (await res.json());
            if (data.messageType === 'error') {
                throw new HydrawiseCommandException_1.HydrawiseCommandException(data.message ?? 'Unknown Hydrawise error');
            }
            return data;
        }
    };
}
//# sourceMappingURL=http.js.map