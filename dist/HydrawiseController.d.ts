/**
 * @author Martijn Dierckx
 */
/** Class representing a Hydrawise controller */
export declare class HydrawiseController {
    id: number;
    name: string;
    serialNumber: string;
    lastContactWithCloud: Date;
    status: string;
    /**
     * Create a new instance of a HydrawiseController
     * @param {object} options - Options object containing all parameters
     * @param {number} options.id - The unique identifier of the controller
     * @param {string} options.name - The name of the controller
     * @param {string} options.serialNumber - The serial number of the controller
     * @param {Date} options.lastContactWithCloud - The last date time the controller was able to contact/sync with the cloud
     * @param {string} options.status - The status as returned by the Hydrawise cloud
     */
    constructor(options: any);
}
//# sourceMappingURL=HydrawiseController.d.ts.map