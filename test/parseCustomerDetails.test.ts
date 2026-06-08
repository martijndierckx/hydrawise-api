import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Hydrawise, HydrawiseConnectionType } from '../src';
import controllersFixture from './fixtures/cloud-customerdetails.json';

describe('getControllers() — characterization', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });
  afterEach(() => {
    mock.restore();
  });

  it('CLOUD: maps controller_id → id, serial_number → serialNumber, last_contact → Date', async () => {
    mock.onGet().reply(200, controllersFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const cs = await h.getControllers();
    expect(cs).toHaveLength(2);
    expect(cs[0].id).toBe(5001);
    expect(cs[0].name).toBe('Garden HC6');
    expect(cs[0].serialNumber).toBe('ABC123XYZ');
    expect(cs[0].lastContactWithCloud.getTime()).toBe(1700000000 * 1000);
  });

  it('LOCAL: returns single dummy controller with url as name', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: '192.168.1.10', password: 'p' });
    const cs = await h.getControllers();
    expect(cs).toHaveLength(1);
    expect(cs[0].name).toBe('http://192.168.1.10/');
  });

  it('getCustomerDetails() rejects on LOCAL binding', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await expect(h.getCustomerDetails('controllers')).rejects.toThrow(/Cloud API/);
  });
});
