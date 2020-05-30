/**
 * @author Martijn Dierckx
 */
import { Hydrawise } from "./Hydrawise";
import { HydrawiseController } from "./HydrawiseController";
/** Class representing a Hydrawise zone */
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
    controller: HydrawiseController;
    /**
     * Create a new instance of a HydrawiseZone
     * @param {object} options - Options object containing all parameters
     * @param {Hydrawise} options.apiBinding - The API binding which can be used to execute commands on the zone
     * @param {number} options.relayID - The unique relay number known to the Hydrawise cloud
     * @param {number} options.zone - The local zone/relay number
     * @param {string} options.name - The name of the zone
     * @param {Date} options.nextRunAt - The date & time of the next scheduled run
     * @param {number} options.nextRunDuration - Run time in seconds of the next run defined by nextRunAt
     * @param {boolean} options.isSuspended - Returns true when the zoneis currently suspended
     * @param {boolean} options.isRunning - Returns true when the zone is actively running
     * @param {number} options.remainingRunningTime - Remaining run time in seconds when isRunning = true
     * @param {HydrawiseController} [options.controller] - The controller linked to the zone
     */
    constructor(options: any);
    /**
     * Sends the run command to the zone/relay
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    run(duration?: number): Promise<any>;
    /**
     * Sends the stop command to the zone/relay
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stop(): Promise<any>;
    /**
     * Sends the suspend command to the zone/relay
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    suspend(duration?: number): Promise<any>;
}
//# sourceMappingURL=HydrawiseZone.d.ts.map