'use strict';
/**
 * @author Martijn Dierckx - Complete rewrite to service both the cloud & local API binding
 * @author Paul Molluzzo (https://paul.molluzzo.com) - Initial 0.1.0 version containing the cloud binding
 */

const Request = require('request-promise');
const HydrawiseZone = require('./HydrawiseZone');
const HydrawiseController = require('./HydrawiseController');
const HydrawiseCommandException = require('./HydrawiseCommandException');

/**
 * Enumeration for the different types of Hydrawise API bindings: Cloud or Local
 * @readonly
 * @enum {string}
 */
class HydrawiseConnectionType {
	static LOCAL = 'LOCAL';
	static CLOUD = 'CLOUD';
}

/** Class representing a Hydrawise local or cloud based API binding */
class Hydrawise {
	
	#cloudUrl = 'https://app.hydrawise.com/api/v1/';
	
	/**
	 * Create a new instance of the Hydrawise API binding
	 * @param {object} options - Options object containing all parameters
	 * @param {string} options.type - The type of binding you wish to make: 'CLOUD' or 'LOCAL'
	 * @param {string} [options.host] - The hostname or ip address of the local host you wish to connect to. Only needed for local bindings.
	 * @param {string} [options.user = admin] - The username of the local Hydrawise controller. Only needed for local bindings (falls back to the default 'admin' user).
	 * @param {string} [options.password] - The password of the local Hydrawise controller. Only needed for local bindings.
	 * @param {string} [options.key] - The API key of your Hydrawise cloud account. Only needed for cloud bindings.
	 */
	constructor(options) {
		this.type = options.type || HydrawiseConnectionType.CLOUD; // CLOUD or LOCAL 
		this.url = options.host ? 'http://'+options.host+'/' : this.#cloudUrl;
		
		// Local Auth
		this.localauth = {
			user: options.user || 'admin',
			password: options.password
		}

		// Cloud Auth
		this.api_key = options.key;
	}

	/**
	 * Private function that makes a GET request to the local or cloud Hydrawise server
	 * @param {string} path - The path of the API endpoint
	 * @param {object} [params] - Parameters to be added to the URL path
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	#request = (path = '', params = {}) => {
		let promise = new Promise((resolve, reject) => {

			// setup basic request
			let options = {
				method : 'GET',
				uri : this.url + path,
				json : true,
				qs : params
			};
			
			// Basic auth for local binding
			if(this.type == HydrawiseConnectionType.LOCAL) {
				let authBuffer = Buffer.from(this.localauth.user+':'+this.localauth.password);
				options.headers = {
					'Authorization': 'Basic '+ authBuffer.toString('base64')
				};
			}
			// API key auth for cloud binding
			else {
				options.qs.api_key = this.api_key;
			}

			// Send request
			Request(options).then((data) => {
				
				//Check for errors
				if(data.messageType == 'error') {
					reject(HydrawiseCommandException(data.message));
				}

				resolve(data);

			}).catch((err) => {
				reject(err);
			});
		});

		// return request
		return promise;
	}

	/**
	 * Sends a command to a single zone/relay
	 * @param {string} action - The required command to be executed for the given zone/relay: run, suspend, stop
	 * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
	 * @param {number} [duration] - How long should the command be executed (only applicable for run & suspend)
	 * @todo Check whether controller_id needs to sent when the account contains multiple zones
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	commandZone(action, zoneOrRelay, duration) {
		let that = this;

		// Get started
		let promise = new Promise((resolve, reject) => {
			let opts = {
				period_id : 998,
				action: action,
			}

			// Set Relay number for local binding
			if(that.type == HydrawiseConnectionType.LOCAL) {
				opts.relay = typeof zoneOrRelay == 'object' ? zoneOrRelay.zone : zoneOrRelay // A zone object, as returned by getZones, or just the relayID can be sent
			} 
			// Set Relay ID for cloud binding
			else {
				opts.relay_id = typeof zoneOrRelay == 'object' ? zoneOrRelay.relayID : zoneOrRelay // A zone object, as returned by getZones, or just the relayID can be sent
			}

			// Custom duration?
			if(duration !== undefined) {
				opts.custom = duration;
			}

			that.setzone(opts).then(data => {
				resolve(data);
			}).catch((err) => {
				reject(err);
			});
		});
		
		return promise;
	}

	/**
	 * Sends a command to all zones/relays
	 * @param {string} action - The required command to be executed: runall, suspendall, stopall
	 * @param {number} [duration] - How long should the given command be executed (only applicable for runall & suspendall)
	 * @todo Check whether controller_id needs to sent when the account contains multiple zones
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	commandAllZones(action, duration) {
		let that = this;

		// Get started
		let promise = new Promise((resolve, reject) => {
			let opts = {
				period_id : 998,
				action: action
			}

			// Custom duration?
			if(duration !== undefined) {
				opts.custom = duration;
			}

			that.setzone(opts).then(data => {
				resolve(data);
			}).catch((err) => {
				reject(err);
			});
		});
		
		return promise;
	}

	/**
	 * Sends the run command to a single zone/relay
	 * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	runZone(zoneOrRelay, duration) {
		return this.commandZone('run', zoneOrRelay, duration);
	}

	/**
	 * Sends the run command to all zones/relays
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	runAllZones(duration) {
		return this.commandZone('runall', duration);
	}

	/**
	 * Sends the suspend command to a single zone/relay
	 * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	suspendZone(zoneOrRelay, duration) {
		return this.commandZone('suspend', zoneOrRelay, duration);
	}

	/**
	 * Sends the suspend command to all zones/relays
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	suspendAllZones(duration) {
		return this.commandZone('suspendall', duration);
	}

	/**
	 * Sends the stop command to a single zone/relay
	 * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	stopZone(zoneOrRelay) {
		return this.commandZone('stop', zoneOrRelay, duration);
	}

	/**
	 * Sends the stop command to all zones/relays
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	stopAllZones() {
		return this.commandZone('stopall', duration);
	}

	/**
	 * Retrieves all zones/relays known to the server
	 * @param {boolean} [onlyConfigured = true] - Only return zones/relays which have been configured
	 * @return {Promise} A Promise which will be resolved when all zones have been retrieved
	 */
	getZones(onlyConfigured = true) {
		let that = this;
	
		// Get started
		let promise = new Promise((resolve, reject) => {
			
			// Get relays
			that.statusschedule().then(data => {
				let zones = [];
				
				// Check every returned relay
				data.relays.map(z => {
					
					// Only configured zones
					if(onlyConfigured && z.type != 110) {
					
						// Zone
						let zone = {
							apiBinding: that,
							relayID: z.relay_id,
							zone: z.relay,
							name: z.name,
							nextRunAt: new Date((data.time + z.time) * 1000),
							nextRunDuration: z.run || z.run_seconds,
							isSuspended: z.suspended !== undefined && z.suspended == 1,
							isRunning: false,
							remainingRunningTime: 0,
						};

						// Only available data for local connections
						if(that.type == HydrawiseConnectionType.LOCAL) {
							zone.defaultRunDuration = z.normalRuntime * 60;
						}

						// Running?
						if(data.running !== undefined) {
							let runningZone = data.running.find(x => {
								return x.relay_id == z.relay_id;
							});
							if(runningZone != undefined && runningZone != null) {
								zone.isRunning = true;
								zone.remainingRunningTime = runningZone.time_left;
							}
						}
						
						zones.push(HydrawiseZone(zone));
					}
				});

				resolve(zones);
			}).catch((err) => {
				reject(err);
			});
		});
		
		return promise;
	}

	/**
	 * Retrieves all controllers known to the Hydrawise cloud
	 * @return {Promise} A Promise which will be resolved when all controllers have been retrieved
	 */
	getControllers() {
		let that = this;
	
		// Get started
		let promise = new Promise((resolve, reject) => {
			
			// Get Controllers
			this.getCustomerDetails('controllers').then(data => {
				let controllers = [];
				
				// Check every returned relay
				data.controllers.map(c => {
					
					// Zone
					let controller = {
						id: c.controller_id,
						name: c.name,
						serialNumber: c.serial_number,
						lastContactWithCloud: new Date(c.last_contact * 1000),
						status: c.status
					};
					
					controllers.push(HydrawiseController(controller));
				});

				resolve(controllers);
			}).catch((err) => {
				reject(err);
			});

		});

		return promise;
	}



	/* -------- Raw API calls -------- */

	/**
	 * Gets the customer ID & list of available controllers configured in the Hydrawise cloud. Only available in cloud binding. 
	 * @param {string} type - Defines the type of customer details to be retrieved alongside the customer ID
	 * @return {Promise} A Promise which will be resolved when the request has returned from the cloud server.
	 */
	getCustomerDetails(type) {
		// Cloud only API
		if (this.type  == HydrawiseConnectionType.LOCAL) { 
			return new Promise((resolve, reject) => {
				reject(HydrawiseCommandException('Calling Cloud API function on a Local Binding'));
			});
		}
		
		return this.#request('customerdetails.php', { type: type });
	}

	/**
	 * Gets the status and schedule of the locally connected controller or all controllers in the cloud 
	 * @param {string} type - Defines the type of customer details to be retrieved alongside the customer ID
	 * @todo Check whether controller_id needs to sent when the account contains multiple zones
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	getStatusAndSchedule(tag = '', hours = '168') {
		let uri = this.type == HydrawiseConnectionType.LOCAL ? 'get_sched_json.php' : 'statusschedule.php';
	
		return this.#request(uri, { tag, hours });
	}

	/*setController(controllerID) {
		// Cloud only API
		if (this.type  == HydrawiseConnectionType.LOCAL) { 
			return new Promise((resolve, reject) => {
				reject(HydrawiseCommandException('Calling Cloud API function on a Local Binding'));
			});
		}
		
		return this.#request('setcontroller.php', { controllerID, json: true });
	}*/

	/**
	 * Sends an action request to a specific or all zones
	 * @param {object} params - Parameters object containing all parameters to be sent along with the request
	 * @param {string} params.action - The action to be executed: run, stop, suspend, runall, suspendall, stopall
	 * @todo Complete params documentation
	 * @todo Check whether controller_id needs to sent when the account contains multiple zones
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	setZone(params = {}) {
		let uri = this.type == HydrawiseConnectionType.LOCAL ? 'set_manual_data.php' : 'setzone.php';
		
		return this.#request(uri, params);
	}



	/* -------- Original 0.1.0 function names for backwards compatibility -------- */

	/**
	 * Does the same as getCustomerDetails, and is only kept to be backwards compatible with version 0.1.0 of this module
	 * @param {string} [type = controllers] - Defines the type of customer details to be retrieved alongside the customer ID
	 * @alias getCustomerDetails
	 * @return {Promise} A Promise which will be resolved when the request has returned from the cloud server.
	 */
	customerdetails(type = 'controllers') {
		return this.getCustomerDetails(type);
	}

	/**
	 * Does the same as getCustomerDetails, and is only kept to be backwards compatible with version 0.1.0 of this module
	 * @alias getStatusAndSchedule
	 * @deprecated since version 1.0.0. Please use getZones()
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	statusschedule(tag = '', hours = '168') {
		return this.getStatusAndSchedule(tag, hours);
	}

	/*setcontroller(controllerID) {
		return this.setController(controllerID);
	}*/

	/**
	 * Does the same as setZone, and is only kept to be backwards compatible with version 0.1.0 of this module
	 * @alias setZone
	 * @deprecated since version 1.0.0. Please use runZone(), suspendZone(), stopZone(), runAllZones(), suspendAllZones(), stopAllZones() or the run(), suspend(), stop() commands on a HydrawiseZone object.
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	setzone(params = {}) {
		return this.setZone(params);
	}
}

module.exports = options => {
	return new Hydrawise(options); // { type: 'CLOUD', key: 'APIKEY' } or { type: 'LOCAL', host: 'LOCAL IP ADDRESS', user: 'USERNAME', password: 'PASSWORD' }
};