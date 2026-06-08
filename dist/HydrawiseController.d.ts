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
export declare class HydrawiseController {
    apiBinding: Hydrawise;
    name: string;
    id: number | undefined;
    serialNumber: string | undefined;
    lastContactWithCloud: Date | undefined;
    status: string | undefined;
    /** Host (e.g. `192.168.1.10`) — only set on LOCAL controllers. Used by consumers to derive stable identifiers. */
    host: string | undefined;
    constructor(init: HydrawiseControllerInit);
    getZones(): Promise<HydrawiseZone[]>;
    runAllZones(duration?: number): Promise<SetZoneResponse>;
    stopAllZones(): Promise<SetZoneResponse>;
    suspendAllZones(duration?: number): Promise<SetZoneResponse>;
}
//# sourceMappingURL=HydrawiseController.d.ts.map