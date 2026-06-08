import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Hydrawise, HydrawiseConnectionType, HydrawiseCommandException } from '../src';
import errorFixture from './fixtures/error-response.json';

describe('error handling — characterization', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });
  afterEach(() => {
    mock.restore();
  });

  it("messageType==='error' rejects with HydrawiseCommandException", async () => {
    mock.onGet().reply(200, errorFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'bad' });
    await expect(h.getZones()).rejects.toBeInstanceOf(HydrawiseCommandException);
  });

  it('exception carries the API message', async () => {
    mock.onGet().reply(200, errorFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'bad' });
    await expect(h.getZones()).rejects.toThrow('Invalid API Key.');
  });
});
