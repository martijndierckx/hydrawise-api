import type { Hydrawise } from './Hydrawise';
import type { HydrawiseZone } from './HydrawiseZone';
import type { SetZoneResponse } from './types';

export interface HydrawiseControllerInit {
  apiBinding: Hydrawise;
  name: string;
  id?: number;
  serialNumber?: string;
  lastContactWithCloud?: Date;
  status?: string;
  host?: string;
}

/** A Hydrawise controller. */
export class HydrawiseController {
  public apiBinding: Hydrawise;
  public name: string;
  public id: number | undefined;
  public serialNumber: string | undefined;
  public lastContactWithCloud: Date | undefined;
  public status: string | undefined;
  /** Host (e.g. `192.168.1.10`) — only set on LOCAL controllers. Used by consumers to derive stable identifiers. */
  public host: string | undefined;

  constructor(init: HydrawiseControllerInit) {
    this.apiBinding = init.apiBinding;
    this.name = init.name;
    this.id = init.id;
    this.serialNumber = init.serialNumber;
    this.lastContactWithCloud = init.lastContactWithCloud;
    this.status = init.status;
    this.host = init.host;
  }

  public getZones(): Promise<HydrawiseZone[]> {
    return this.apiBinding.getZones(this);
  }

  public runAllZones(duration?: number): Promise<SetZoneResponse> {
    return this.apiBinding.commandAllZones('runall', this, duration);
  }

  public stopAllZones(): Promise<SetZoneResponse> {
    return this.apiBinding.commandAllZones('stopall', this);
  }

  public suspendAllZones(duration?: number): Promise<SetZoneResponse> {
    return this.apiBinding.commandAllZones('suspendall', this, duration);
  }
}
