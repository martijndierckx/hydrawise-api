export declare enum ZoneAction {
    Run = "run",
    Stop = "stop",
    Suspend = "suspend",
    RunAll = "runall",
    StopAll = "stopall",
    SuspendAll = "suspendall"
}
export type SingleZoneAction = ZoneAction.Run | ZoneAction.Stop | ZoneAction.Suspend;
export type AllZonesAction = ZoneAction.RunAll | ZoneAction.StopAll | ZoneAction.SuspendAll;
export type HydrawiseConfig = {
    type: 'LOCAL';
    host: string;
    password: string;
    user?: string;
} | {
    type: 'CLOUD';
    key: string;
};
export interface RelayRow {
    relay_id: number;
    relay: number;
    name: string;
    time: number;
    run?: number;
    run_seconds?: number;
    suspended?: 0 | 1;
    normalRuntime?: number;
    lastwaterepoch?: number;
}
export interface RunningRow {
    relay_id: number;
    time_left: number;
}
interface ApiResponseEnvelope {
    message?: string;
    messageType?: 'info' | 'error';
}
export interface LocalStatusResponse extends ApiResponseEnvelope {
    time: number;
    relays: RelayRow[];
    running?: RunningRow[];
}
export interface CloudStatusResponse extends ApiResponseEnvelope {
    time: number;
    relays: RelayRow[];
}
export interface CloudControllerRow {
    controller_id: number;
    name: string;
    serial_number: string;
    last_contact: number;
    status: string;
}
export interface CloudCustomerDetailsResponse extends ApiResponseEnvelope {
    customer_id?: number;
    controllers: CloudControllerRow[];
}
export interface SetZoneResponse extends ApiResponseEnvelope {
    message: string;
    messageType: 'info' | 'error';
}
export {};
//# sourceMappingURL=types.d.ts.map