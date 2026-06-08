import { describe, it, expect, afterEach } from 'vitest';
import { Hydrawise, HydrawiseConnectionType, HydrawiseController, HydrawiseZone, ZoneAction } from '../src';
import { setupFetchMock, restoreFetchMock } from './helpers/fetchMock';

const OK = { message: 'ok', messageType: 'info' as const };

function makeZone(h: Hydrawise, relayID: number, zone: number, controller?: HydrawiseController) {
  return new HydrawiseZone({
    apiBinding: h,
    relayID,
    zone,
    name: 'Z',
    nextRunAt: new Date(0),
    nextRunDuration: 0,
    isSuspended: false,
    isRunning: false,
    remainingRunningTime: 0,
    controller
  });
}

describe('commandZone()', () => {
  afterEach(() => restoreFetchMock());

  it('LOCAL run uses relay=<zone> + action=run + period_id=998', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandZone(ZoneAction.Run, 3);
    expect(calls[0].url).toContain('set_manual_data.php');
    expect(calls[0].params).toMatchObject({ relay: '3', action: 'run', period_id: '998' });
    expect(calls[0].params).not.toHaveProperty('custom');
    expect(calls[0].params).not.toHaveProperty('relay_id');
  });

  it('LOCAL run with duration adds custom=<duration>', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandZone(ZoneAction.Run, 1, 600);
    expect(calls[0].params).toMatchObject({ relay: '1', action: 'run', custom: '600' });
  });

  it('CLOUD run uses relay_id=<relayID> + action=run', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    await h.commandZone(ZoneAction.Run, 2001);
    expect(calls[0].url).toContain('setzone.php');
    expect(calls[0].params).toMatchObject({ relay_id: '2001', action: 'run', period_id: '998' });
    expect(calls[0].params).not.toHaveProperty('relay');
  });

  it('CLOUD run with controller-bound zone adds controller_id', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const controller = new HydrawiseController({ apiBinding: h, id: 5001, name: 'C' });
    const zone = makeZone(h, 2001, 1, controller);
    await h.commandZone(ZoneAction.Run, zone, 120);
    expect(calls[0].params).toMatchObject({
      relay_id: '2001',
      action: 'run',
      custom: '120',
      controller_id: '5001'
    });
  });

  it('LOCAL stop sends action=stop', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandZone(ZoneAction.Stop, 5);
    expect(calls[0].params).toMatchObject({ relay: '5', action: 'stop' });
  });

  it('accepts legacy string action "run"', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandZone('run', 1);
    expect(calls[0].params).toMatchObject({ action: 'run' });
  });
});

describe('commandAllZones()', () => {
  afterEach(() => restoreFetchMock());

  it('CLOUD runall with controller adds controller_id', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const controller = new HydrawiseController({ apiBinding: h, id: 5001, name: 'C' });
    await h.commandAllZones(ZoneAction.RunAll, controller);
    expect(calls[0].params).toMatchObject({ action: 'runall', controller_id: '5001' });
  });

  it('LOCAL stopall sends action=stopall', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandAllZones(ZoneAction.StopAll);
    expect(calls[0].params).toMatchObject({ action: 'stopall', period_id: '998' });
    expect(calls[0].params).not.toHaveProperty('controller_id');
  });

  it('CLOUD runall with duration includes custom', async () => {
    const { calls } = setupFetchMock(OK);
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    await h.commandAllZones(ZoneAction.RunAll, undefined, 300);
    expect(calls[0].params).toMatchObject({ action: 'runall', custom: '300' });
  });
});
