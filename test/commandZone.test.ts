import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Hydrawise, HydrawiseConnectionType, HydrawiseController, HydrawiseZone } from '../src';

describe('commandZone() — characterization', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet().reply(200, { message: 'ok', messageType: 'info' });
  });
  afterEach(() => {
    mock.restore();
  });

  it('LOCAL run uses relay=<zone> + action=run + period_id=998', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandZone('run', 3);
    const req = mock.history.get[0];
    expect(req.url).toContain('set_manual_data.php');
    expect(req.params).toMatchObject({ relay: 3, action: 'run', period_id: 998 });
    expect(req.params).not.toHaveProperty('custom');
    expect(req.params).not.toHaveProperty('relay_id');
  });

  it('LOCAL run with duration adds custom=<duration>', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandZone('run', 1, 600);
    expect(mock.history.get[0].params).toMatchObject({ relay: 1, action: 'run', custom: 600 });
  });

  it('CLOUD run uses relay_id=<relayID> + action=run', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    await h.commandZone('run', 2001);
    const req = mock.history.get[0];
    expect(req.url).toContain('setzone.php');
    expect(req.params).toMatchObject({ relay_id: 2001, action: 'run', period_id: 998 });
    expect(req.params).not.toHaveProperty('relay');
  });

  it('CLOUD run with controller-bound zone adds controller_id', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const controller = new HydrawiseController({ apiBinding: h, id: 5001, name: 'C' } as any);
    const zone = new HydrawiseZone({ apiBinding: h, relayID: 2001, zone: 1, name: 'Z', controller } as any);
    await h.commandZone('run', zone, 120);
    expect(mock.history.get[0].params).toMatchObject({ relay_id: 2001, action: 'run', custom: 120, controller_id: 5001 });
  });

  it('LOCAL stop sends action=stop', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandZone('stop', 5);
    expect(mock.history.get[0].params).toMatchObject({ relay: 5, action: 'stop' });
  });
});

describe('commandAllZones() — characterization', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet().reply(200, { message: 'ok', messageType: 'info' });
  });
  afterEach(() => {
    mock.restore();
  });

  it('CLOUD runall with controller adds controller_id', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    const controller = new HydrawiseController({ apiBinding: h, id: 5001, name: 'C' } as any);
    await h.commandAllZones('runall', controller);
    expect(mock.history.get[0].params).toMatchObject({ action: 'runall', controller_id: 5001 });
  });

  it('LOCAL stopall sends action=stopall', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.LOCAL, host: 'h', password: 'p' });
    await h.commandAllZones('stopall');
    expect(mock.history.get[0].params).toMatchObject({ action: 'stopall', period_id: 998 });
    expect(mock.history.get[0].params).not.toHaveProperty('controller_id');
  });

  it('CLOUD runall with duration includes custom', async () => {
    const h = new Hydrawise({ type: HydrawiseConnectionType.CLOUD, key: 'k' });
    await h.commandAllZones('runall', undefined, 300);
    expect(mock.history.get[0].params).toMatchObject({ action: 'runall', custom: 300 });
  });
});
