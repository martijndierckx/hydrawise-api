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
     * @param {Hydrawise} options.apiBinding - The API binding which can be used to execute commands on the zone
     * @param {number} options.id - The unique identifier of the controller
     * @param {string} options.name - The name of the controller
     * @param {string} options.serialNumber - The serial number of the controller
     * @param {Date} options.lastContactWithCloud - The last date time the controller was able to contact/sync with the cloud
     * @param {string} options.status - The status as returned by the Hydrawise cloud
     */
    constructor(options) {
        this.apiBinding = options.apiBinding;
        this.id = options.id;
        this.name = options.name;
        this.serialNumber = options.serialNumber;
        this.lastContactWithCloud = options.lastContactWithCloud;
        this.status = options.status;
    }
    /**
     * Retrieves all zones/relays known to the server for this controller
     * @return {Promise} A Promise which will be resolved when all zones have been retrieved
     */
    getZones() {
        return this.apiBinding.getZones(this);
    }
    /**
     * Sends the run command to all the zones/relays of the controller
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    runAllZones(duration) {
        return this.apiBinding.commandAllZones('runall', this, duration);
    }
    /**
     * Sends the stop command to all the zones/relays of the controller
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopAllZones() {
        return this.apiBinding.commandAllZones('stopall', this);
    }
    /**
     * Sends the suspend command to all the zones/relays of the controller
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    suspendAllZones(duration) {
        return this.apiBinding.commandAllZones('suspendall', this, duration);
    }
}
exports.HydrawiseController = HydrawiseController;
//# sourceMappingURL=HydrawiseController.js.map