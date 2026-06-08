import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Hydrawise, HydrawiseConnectionType } from '../src';
import localFixture from './fixtures/local-get-sched.json';
import localRunningFixture from './fixtures/local-get-sched-with-running.json';

describe('LOCAL getZones() — characterization', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });
  afterEach(() => {
    mock.restore();
  });

  it('excludes relays with lastwaterepoch == 0', async () => {
    mock.onGet().reply(200, localFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    const zones = await h.getZones();
    expect(zones).toHaveLength(2);
    expect(zones.map((z) => z.name)).toEqual(['Front Lawn', 'Back Lawn']);
  });

  it('maps relay_id → relayID and relay → zone', async () => {
    mock.onGet().reply(200, localFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    const [front] = await h.getZones();
    expect(front.relayID).toBe(1001);
    expect(front.zone).toBe(1);
  });

  it('computes nextRunAt from (data.time + z.time) * 1000', async () => {
    mock.onGet().reply(200, localFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    const [front] = await h.getZones();
    expect(front.nextRunAt.getTime()).toBe((1700000000 + 3600) * 1000);
  });

  // Note: in v1.2.1, `defaultRunDuration` is set on the temp object in Hydrawise.ts
  // but never copied by the HydrawiseZone constructor. Phase D will wire it through properly.
  it('v1 leaks: defaultRunDuration is silently dropped by HydrawiseZone constructor (pre-existing bug)', async () => {
    mock.onGet().reply(200, localFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    const [front] = await h.getZones();
    expect((front as any).defaultRunDuration).toBeUndefined();
  });

  it('isRunning=false when data.running is empty', async () => {
    mock.onGet().reply(200, localFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    const [front] = await h.getZones();
    expect(front.isRunning).toBe(false);
    expect(front.remainingRunningTime).toBe(0);
  });

  it('isRunning=true and remainingRunningTime=time_left when relay is in data.running', async () => {
    mock.onGet().reply(200, localRunningFixture);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    const zones = await h.getZones();
    const front = zones.find((z) => z.relayID === 1001)!;
    const back = zones.find((z) => z.relayID === 1002)!;
    expect(front.isRunning).toBe(true);
    expect(front.remainingRunningTime).toBe(420);
    expect(back.isRunning).toBe(false);
  });
});
