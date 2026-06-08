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
export declare class HydrawiseZone {
    apiBinding: Hydrawise;
    relayID: number;
    zone: number;
    name: string;
    nextRunAt: Date;
    nextRunDuration: number;
    isSuspended: boolean;
    isRunning: boolean;
    remainingRunningTime: number;
    controller: HydrawiseController | undefined;
    defaultRunDuration: number | undefined;
    constructor(init: HydrawiseZoneInit);
    run(duration?: number): Promise<SetZoneResponse>;
    stop(): Promise<SetZoneResponse>;
    suspend(duration?: number): Promise<SetZoneResponse>;
}
//# sourceMappingURL=HydrawiseZone.d.ts.map