'use strict';
/**
 * @author Martijn Dierckx
 */

/** Class representing a Hydrawise controller */
class HydrawiseController {

	/**
	 * Create a new instance of a HydrawiseController
	 * @param {object} options - Options object containing all parameters
	 * @param {Hydrawise} options.apiBinding - The API binding which can be used to execute commands on the zone
	 */
	constructor(options) {
		this.id = options.id;
		this.name = options.name;
		this.serialNumber = options.serialNumber;
		this.lastContactWithCloud = options.lastContactWithCloud;
		this.status = options.status;
	}
}

module.exports = options => {
	return new HydrawiseController(options);
};