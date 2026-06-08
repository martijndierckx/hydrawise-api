import { HydrawiseConnectionType } from './HydrawiseConnectionType';
import { HydrawiseZone } from './HydrawiseZone';
import { HydrawiseController } from './HydrawiseController';
import { type SingleZoneAction, type AllZonesAction, type LocalStatusResponse, type CloudStatusResponse, type CloudCustomerDetailsResponse, type SetZoneResponse } from './types';
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
/** Binding to the Hydrawise local controller API or cloud API. */
export declare class Hydrawise {
    readonly type: HydrawiseConnectionType;
    readonly url: string;
    readonly localAuthUsername: string;
    readonly localAuthPassword: string;
    readonly cloudAuthAPIkey: string;
    private readonly config;
    private readonly http;
    constructor(options: HydrawiseConstructorOptions);
    getStatusAndSchedule(controllerId?: number): Promise<LocalStatusResponse | CloudStatusResponse>;
    getCustomerDetails(type: string): Promise<CloudCustomerDetailsResponse>;
    setZone(params: Record<string, string | number | undefined>, controllerId?: number): Promise<SetZoneResponse>;
    commandZone(action: SingleZoneAction | 'run' | 'stop' | 'suspend', zoneOrRelay: number | HydrawiseZone, duration?: number): Promise<SetZoneResponse>;
    commandAllZones(action: AllZonesAction | 'runall' | 'stopall' | 'suspendall', controller?: HydrawiseController | number, duration?: number): Promise<SetZoneResponse>;
    runZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<SetZoneResponse>;
    stopZone(zoneOrRelay: HydrawiseZone | number): Promise<SetZoneResponse>;
    suspendZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<SetZoneResponse>;
    runAllZones(controller?: HydrawiseController, duration?: number): Promise<SetZoneResponse>;
    stopAllZones(controller?: HydrawiseController): Promise<SetZoneResponse>;
    suspendAllZones(controller?: HydrawiseController, duration?: number): Promise<SetZoneResponse>;
    getZones(controller?: HydrawiseController | number): Promise<HydrawiseZone[]>;
    getControllers(): Promise<HydrawiseController[]>;
    private parseZones;
    private zoneFromRow;
}
//# sourceMappingURL=Hydrawise.d.ts.map