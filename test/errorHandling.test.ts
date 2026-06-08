import { describe, it, expect, afterEach } from 'vitest';
import { Hydrawise, HydrawiseConnectionType, HydrawiseCommandException } from '../src';
import { setupFetchMock, restoreFetchMock } from './helpers/fetchMock';
import errorFixture from './fixtures/error-response.json';

describe('error handling', () => {
  afterEach(() => restoreFetchMock());

  it("messageType==='error' rejects with HydrawiseCommandException", async () => {
    setupFetchMock(errorFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'bad' });
    await expect(h.getZones()).rejects.toBeInstanceOf(HydrawiseCommandException);
  });

  it('exception carries the API message', async () => {
    setupFetchMock(errorFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'bad' });
    await expect(h.getZones()).rejects.toThrow('Invalid API Key.');
  });
});
