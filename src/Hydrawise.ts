import { HydrawiseConnectionType } from './HydrawiseConnectionType';
import { HydrawiseZone } from './HydrawiseZone';
import { HydrawiseController } from './HydrawiseController';
import { createHttpClient, type HttpClient } from './http';
import {
  ZoneAction,
  type SingleZoneAction,
  type AllZonesAction,
  type HydrawiseConfig,
  type LocalStatusResponse,
  type CloudStatusResponse,
  type CloudCustomerDetailsResponse,
  type SetZoneResponse,
  type RelayRow,
  type RunningRow
} from './types';

/**
 * Loose constructor input. Accepts the legacy v1 shape ({type, host?, password?, key?, ...})
 * and the v2 discriminated union. Validated and narrowed in the constructor.
 */
export interface HydrawiseConstructorOptions {
  type: HydrawiseConnectionType | 'LOCAL' | 'CLOUD';
  host?: string;
  user?: string;
  password?: string;
  key?: string;
}

const CLOUD_URL = 'https://app.hydrawise.com/api/v1/';

/** Binding to the Hydrawise local controller API or cloud API. */
export class Hydrawise {
  public readonly type: HydrawiseConnectionType;
  public readonly url: string;
  public readonly localAuthUsername: string;
  public readonly localAuthPassword: string;
  public readonly cloudAuthAPIkey: string;

  private readonly config: HydrawiseConfig;
  private readonly http: HttpClient;

  constructor(options: HydrawiseConstructorOptions) {
    if (options.type === 'LOCAL') {
      if (!options.host) {
        throw new Error('LOCAL Hydrawise binding requires `host`');
      }
      if (options.password === undefined) {
        throw new Error('LOCAL Hydrawise binding requires `password`');
      }
      const user = options.user ?? 'admin';
      this.config = { type: 'LOCAL', host: options.host, password: options.password, user };
      this.type = HydrawiseConnectionType.LOCAL;
      this.url = `http://${options.host}/`;
      this.localAuthUsername = user;
      this.localAuthPassword = options.password;
      this.cloudAuthAPIkey = '';
    } else if (options.type === 'CLOUD') {
      if (!options.key) {
        throw new Error('CLOUD Hydrawise binding requires `key`');
      }
      this.config = { type: 'CLOUD', key: options.key };
      this.type = HydrawiseConnectionType.CLOUD;
      this.url = CLOUD_URL;
      this.localAuthUsername = '';
      this.localAuthPassword = '';
      this.cloudAuthAPIkey = options.key;
    } else {
      throw new Error(`Unknown Hydrawise connection type: ${String(options.type)}`);
    }
    this.http = createHttpClient(this.config);
  }

  // ---- Raw API ----

  public async getStatusAndSchedule(controllerId?: number): Promise<LocalStatusResponse | CloudStatusResponse> {
    const path = this.type === HydrawiseConnectionType.LOCAL ? 'get_sched_json.php' : 'statusschedule.php';
    return this.http.get<LocalStatusResponse | CloudStatusResponse>(path, { controller_id: controllerId });
  }

  public async getCustomerDetails(type: string): Promise<CloudCustomerDetailsResponse> {
    if (this.type === HydrawiseConnectionType.LOCAL) {
      throw new Error('Calling Cloud API function on a Local Binding');
    }
    return this.http.get<CloudCustomerDetailsResponse>('customerdetails.php', { type });
  }

  public async setZone(params: Record<string, string | number | undefined>, controllerId?: number): Promise<SetZoneResponse> {
    const path = this.type === HydrawiseConnectionType.LOCAL ? 'set_manual_data.php' : 'setzone.php';
    return this.http.get<SetZoneResponse>(path, controllerId !== undefined ? { ...params, controller_id: controllerId } : params);
  }

  // ---- High-level commands ----

  public async commandZone(
    action: SingleZoneAction | 'run' | 'stop' | 'suspend',
    zoneOrRelay: number | HydrawiseZone,
    duration?: number
  ): Promise<SetZoneResponse> {
    const params: Record<string, string | number | undefined> = {
      period_id: 998,
      action
    };

    if (this.type === HydrawiseConnectionType.LOCAL) {
      params['relay'] = zoneOrRelay instanceof HydrawiseZone ? zoneOrRelay.zone : zoneOrRelay;
    } else {
      params['relay_id'] = zoneOrRelay instanceof HydrawiseZone ? zoneOrRelay.relayID : zoneOrRelay;
    }

    if (duration !== undefined) {
      params['custom'] = duration;
    }

    let controllerId: number | undefined;
    if (
      this.type === HydrawiseConnectionType.CLOUD &&
      zoneOrRelay instanceof HydrawiseZone &&
      zoneOrRelay.controller !== undefined &&
      zoneOrRelay.controller.id !== undefined
    ) {
      controllerId = zoneOrRelay.controller.id;
    }

    return this.setZone(params, controllerId);
  }

  public async commandAllZones(
    action: AllZonesAction | 'runall' | 'stopall' | 'suspendall',
    controller?: HydrawiseController | number,
    duration?: number
  ): Promise<SetZoneResponse> {
    const params: Record<string, string | number | undefined> = {
      period_id: 998,
      action
    };

    if (duration !== undefined) {
      params['custom'] = duration;
    }

    let controllerId: number | undefined;
    if (this.type === HydrawiseConnectionType.CLOUD && controller !== undefined) {
      controllerId = controller instanceof HydrawiseController ? controller.id : controller;
    }

    return this.setZone(params, controllerId);
  }

  public runZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<SetZoneResponse> {
    return this.commandZone(ZoneAction.Run, zoneOrRelay, duration);
  }

  public stopZone(zoneOrRelay: HydrawiseZone | number): Promise<SetZoneResponse> {
    return this.commandZone(ZoneAction.Stop, zoneOrRelay);
  }

  public suspendZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<SetZoneResponse> {
    return this.commandZone(ZoneAction.Suspend, zoneOrRelay, duration);
  }

  public runAllZones(controller?: HydrawiseController, duration?: number): Promise<SetZoneResponse> {
    return this.commandAllZones(ZoneAction.RunAll, controller, duration);
  }

  public stopAllZones(controller?: HydrawiseController): Promise<SetZoneResponse> {
    return this.commandAllZones(ZoneAction.StopAll, controller);
  }

  public suspendAllZones(controller?: HydrawiseController, duration?: number): Promise<SetZoneResponse> {
    return this.commandAllZones(ZoneAction.SuspendAll, controller, duration);
  }

  // ---- Hydrated objects ----

  public async getZones(controller?: HydrawiseController | number): Promise<HydrawiseZone[]> {
    const controllerObj = controller instanceof HydrawiseController ? controller : undefined;
    const controllerId = controller instanceof HydrawiseController ? controller.id : controller;
    const data = await this.getStatusAndSchedule(controllerId);
    return this.parseZones(data, controllerObj);
  }

  public async getControllers(): Promise<HydrawiseController[]> {
    if (this.type === HydrawiseConnectionType.LOCAL) {
      const localConfig = this.config as { type: 'LOCAL'; host: string };
      return [
        new HydrawiseController({
          apiBinding: this,
          name: this.url,
          host: localConfig.host
        })
      ];
    }
    const data = await this.getCustomerDetails('controllers');
    return data.controllers.map(
      (c) =>
        new HydrawiseController({
          apiBinding: this,
          id: c.controller_id,
          name: c.name,
          serialNumber: c.serial_number,
          lastContactWithCloud: new Date(c.last_contact * 1000),
          status: c.status
        })
    );
  }

  // ---- Parsing ----

  private parseZones(data: LocalStatusResponse | CloudStatusResponse, controller?: HydrawiseController): HydrawiseZone[] {
    const zones: HydrawiseZone[] = [];
    const running: RunningRow[] = (data as LocalStatusResponse).running ?? [];

    for (const z of data.relays) {
      const init = this.zoneFromRow(z, data.time, running, controller);
      zones.push(new HydrawiseZone(init));
    }
    return zones;
  }

  private zoneFromRow(z: RelayRow, dataTime: number, running: RunningRow[], controller?: HydrawiseController) {
    const isLocal = this.type === HydrawiseConnectionType.LOCAL;
    const init = {
      apiBinding: this,
      relayID: z.relay_id,
      zone: z.relay,
      name: z.name,
      nextRunAt: new Date((dataTime + z.time) * 1000),
      nextRunDuration: z.run ?? z.run_seconds ?? 0,
      isSuspended: z.suspended === 1,
      isRunning: false as boolean,
      remainingRunningTime: 0 as number,
      controller,
      defaultRunDuration: isLocal && z.normalRuntime !== undefined ? z.normalRuntime * 60 : undefined
    };

    // Running detection — LOCAL via data.running[], CLOUD via z.time === 1
    if (isLocal) {
      const runningZone = running.find((r) => r.relay_id === z.relay_id);
      if (runningZone !== undefined) {
        init.isRunning = true;
        init.remainingRunningTime = runningZone.time_left;
      }
    } else if (z.time === 1) {
      init.isRunning = true;
      init.remainingRunningTime = z.run ?? 0;
    }

    return init;
  }
}
