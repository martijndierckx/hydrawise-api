/**
 * @author Martijn Dierckx
 */
import { Hydrawise, HydrawiseZone } from ".";
/** Class representing a Hydrawise controller */
export declare class HydrawiseController {
    apiBinding: Hydrawise;
    id: number;
    name: string;
    serialNumber: string;
    lastContactWithCloud: Date;
    status: string;
    /**
     * Create a new instance of a HydrawiseController
     * @param {object} options - Options object containing all parameters
     * @param {Hydrawise} options.apiBinding - The API binding which can be used to execute commands on the zone
     * @param {number} options.id - The unique identifier of the controller
     * @param {string} options.name - The name of the controller
     * @param {string} options.serialNumber - The serial number of the controller
     * @param {Date} options.lastContactWithCloud - The last date time the controller was able to contact/sync with the cloud
     * @param {string} options.status - The status as returned by the Hydrawise cloud
     */
    constructor(options: any);
    /**
     * Retrieves all zones/relays known to the server for this controller
     * @return {Promise} A Promise which will be resolved when all zones have been retrieved
     */
    getZones(): Promise<HydrawiseZone[]>;
    /**
     * Sends the run command to all the zones/relays of the controller
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    runAllZones(duration?: number): Promise<any>;
    /**
     * Sends the stop command to all the zones/relays of the controller
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopAllZones(): Promise<any>;
    /**
     * Sends the suspend command to all the zones/relays of the controller
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    suspendAllZones(duration?: number): Promise<any>;
}
//# sourceMappingURL=HydrawiseController.d.ts.map