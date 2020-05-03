"use strict";
/**
 * @author Martijn Dierckx
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** Class representing a Hydrawise controller */
class HydrawiseController {
    /**
     * Create a new instance of a HydrawiseController
     * @param {object} options - Options object containing all parameters
     * @param {number} options.id - The unique identifier of the controller
     * @param {string} options.name - The name of the controller
     * @param {string} options.serialNumber - The serial number of the controller
     * @param {Date} options.lastContactWithCloud - The last date time the controller was able to contact/sync with the cloud
     * @param {string} options.status - The status as returned by the Hydrawise cloud
     */
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
        this.serialNumber = options.serialNumber;
        this.lastContactWithCloud = options.lastContactWithCloud;
        this.status = options.status;
    }
}
exports.HydrawiseController = HydrawiseController;
//# sourceMappingURL=HydrawiseController.js.map