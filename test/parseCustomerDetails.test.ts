import { describe, it, expect, afterEach } from 'vitest';
import { Hydrawise, HydrawiseConnectionType } from '../src';
import { setupFetchMock, restoreFetchMock } from './helpers/fetchMock';
import controllersFixture from './fixtures/cloud-customerdetails.json';

describe('getControllers()', () => {
  afterEach(() => restoreFetchMock());

  it('CLOUD: maps controller_id → id, serial_number → serialNumber, last_contact → Date', async () => {
    setupFetchMock(controllersFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const cs = await h.getControllers();
    expect(cs).toHaveLength(2);
    expect(cs[0].id).toBe(5001);
    expect(cs[0].name).toBe('Garden HC6');
    expect(cs[0].serialNumber).toBe('ABC123XYZ');
    expect(cs[0].lastContactWithCloud!.getTime()).toBe(1700000000 * 1000);
  });

  it('LOCAL: returns single dummy controller with url as name and host populated (NEW v2 field)', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: '192.168.1.10', password: 'p' });
    const cs = await h.getControllers();
    expect(cs).toHaveLength(1);
    expect(cs[0].name).toBe('http://192.168.1.10/');
    expect(cs[0].host).toBe('192.168.1.10');
  });

  it('getCustomerDetails() throws on LOCAL binding', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await expect(h.getCustomerDetails('controllers')).rejects.toThrow(/Cloud API/);
  });
});
