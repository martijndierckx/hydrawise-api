import { describe, it, expect, afterEach } from 'vitest';
import { Hydrawise, HydrawiseConnectionType, HydrawiseController } from '../src';
import { setupFetchMock, restoreFetchMock } from './helpers/fetchMock';
import cloudFixture from './fixtures/cloud-statusschedule.json';
import cloudRunningFixture from './fixtures/cloud-statusschedule-running.json';

describe('CLOUD getZones()', () => {
  afterEach(() => restoreFetchMock());

  it('returns all zones regardless of lastwaterepoch', async () => {
    setupFetchMock(cloudFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const zones = await h.getZones();
    expect(zones).toHaveLength(2);
  });

  it('maps relay_id → relayID, relay → zone, name → name', async () => {
    setupFetchMock(cloudFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const [z1] = await h.getZones();
    expect(z1.relayID).toBe(2001);
    expect(z1.zone).toBe(1);
    expect(z1.name).toBe('Cloud Zone 1');
  });

  it('isRunning=true when z.time === 1 with remainingRunningTime = z.run', async () => {
    setupFetchMock(cloudRunningFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const zones = await h.getZones();
    const z1 = zones.find((z) => z.relayID === 2001)!;
    const z2 = zones.find((z) => z.relayID === 2002)!;
    expect(z1.isRunning).toBe(true);
    expect(z1.remainingRunningTime).toBe(540);
    expect(z2.isRunning).toBe(false);
  });

  it('links provided HydrawiseController to every zone', async () => {
    setupFetchMock(cloudFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const controller = new HydrawiseController({ apiBinding: h, id: 5001, name: 'C' });
    const zones = await h.getZones(controller);
    for (const z of zones) {
      expect(z.controller).toBe(controller);
    }
  });

  it('does not set defaultRunDuration on cloud zones', async () => {
    setupFetchMock(cloudFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const [z1] = await h.getZones();
    expect(z1.defaultRunDuration).toBeUndefined();
  });
});
