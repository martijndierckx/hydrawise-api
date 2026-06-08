import type { Hydrawise } from './Hydrawise';
import type { HydrawiseController } from './HydrawiseController';
import type { SetZoneResponse } from './types';

export interface HydrawiseZoneInit {
  apiBinding: Hydrawise;
  relayID: number;
  zone: number;
  name: string;
  nextRunAt: Date;
  nextRunDuration: number;
  isSuspended: boolean;
  isRunning: boolean;
  remainingRunningTime: number;
  controller?: HydrawiseController;
  defaultRunDuration?: number;
}

/** A Hydrawise zone/relay (sprinkler valve). */
export class HydrawiseZone {
  public apiBinding: Hydrawise;
  public relayID: number;
  public zone: number;
  public name: string;
  public nextRunAt: Date;
  public nextRunDuration: number;
  public isSuspended: boolean;
  public isRunning: boolean;
  public remainingRunningTime: number;
  public controller: HydrawiseController | undefined;
  public defaultRunDuration: number | undefined;

  constructor(init: HydrawiseZoneInit) {
    this.apiBinding = init.apiBinding;
    this.relayID = init.relayID;
    this.zone = init.zone;
    this.name = init.name;
    this.nextRunAt = init.nextRunAt;
    this.nextRunDuration = init.nextRunDuration;
    this.isSuspended = init.isSuspended;
    this.isRunning = init.isRunning;
    this.remainingRunningTime = init.remainingRunningTime;
    this.controller = init.controller;
    this.defaultRunDuration = init.defaultRunDuration;
  }

  public run(duration?: number): Promise<SetZoneResponse> {
    return this.apiBinding.commandZone('run', this, duration);
  }

  public stop(): Promise<SetZoneResponse> {
    return this.apiBinding.commandZone('stop', this);
  }

  public suspend(duration?: number): Promise<SetZoneResponse> {
    return this.apiBinding.commandZone('suspend', this, duration);
  }
}
