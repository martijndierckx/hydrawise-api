import { describe, it, expect } from 'vitest';
import { Hydrawise, HydrawiseConnectionType } from '../src';

describe('Hydrawise constructor (v1 behavior — characterization)', () => {
  it('accepts LOCAL config with host/password (defaults user to admin)', () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: '192.168.1.10', password: 'pw' });
    expect(h.type).toBe(HydrawiseConnectionType.LOCAL);
    expect(h.localAuthUsername).toBe('admin');
    expect(h.localAuthPassword).toBe('pw');
    expect(h.url).toBe('http://192.168.1.10/');
  });

  it('accepts LOCAL config with custom user', () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p', user: 'root' });
    expect(h.localAuthUsername).toBe('root');
  });

  it('accepts CLOUD config with key', () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'apikey-xyz' });
    expect(h.type).toBe(HydrawiseConnectionType.CLOUD);
    expect(h.cloudAuthAPIkey).toBe('apikey-xyz');
    expect(h.url).toBe('https://app.hydrawise.com/api/v1/');
  });
});
