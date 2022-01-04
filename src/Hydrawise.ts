/**
 * @author Martijn Dierckx - Complete rewrite to service both the cloud & local API binding
 * @author Paul Molluzzo (https://paulmolluzzo.com) - Initial 0.1.0 version containing the cloud binding
 */

import { HydrawiseConnectionType } from './HydrawiseConnectionType';
import { HydrawiseZone } from './HydrawiseZone';
import { HydrawiseController } from './HydrawiseController';
import { HydrawiseCommandException } from './HydrawiseCommandException';
import Axios from 'axios';
import { ifError } from 'assert';

interface HydrawiseConfiguration {
	type : HydrawiseConnectionType,
	host ?: string,
	user ?: string,
	password ?: string,
	key ?: string
}

/** Class representing a Hydrawise local or cloud based API binding */
export class Hydrawise {
	
	private readonly cloudUrl: string = 'https://app.hydrawise.com/api/v1/';
	public type: HydrawiseConnectionType;
	public url: string;
	public localAuthUsername: string;
	public localAuthPassword: string;
	public cloudAuthAPIkey: string;
	
	/**
	 * Create a new instance of the Hydrawise API binding
	 * @param {object} options - Options object containing all parameters
	 * @param {string} options.type - The type of binding you wish to make: 'CLOUD' or 'LOCAL'
	 * @param {string} [options.host] - The hostname or ip address of the local host you wish to connect to. Only needed for local bindings.
	 * @param {string} [options.user = admin] - The username of the local Hydrawise controller. Only needed for local bindings (falls back to the default 'admin' user).
	 * @param {string} [options.password] - The password of the local Hydrawise controller. Only needed for local bindings.
	 * @param {string} [options.key] - The API key of your Hydrawise cloud account. Only needed for cloud bindings.
	 */
	constructor(options: HydrawiseConfiguration) {
		this.type = options.type || HydrawiseConnectionType.CLOUD; // CLOUD or LOCAL 
		this.url = (this.type == HydrawiseConnectionType.LOCAL ? 'http://'+options.host+'/' : this.cloudUrl);
		
		// Local Auth
		this.localAuthUsername = options.user || 'admin';
		this.localAuthPassword = options.password || '';

		// Cloud Auth
		this.cloudAuthAPIkey = options.key || '';
	}

	/**
	 * Private function that makes a GET request to the local or cloud Hydrawise server
	 * @param {string} path - The path of the API endpoint
	 * @param {object} [params] - Parameters to be added to the URL path
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	private request(path: string = '', params: any = {}): Promise<any> {
		let promise = new Promise((resolve, reject) => {

			// setup basic request
			let options: any = {
				method : 'get',
				url : this.url + path,
				params : params,
				json : true
			};
			
			// Basic auth for local binding
			if(this.type == HydrawiseConnectionType.LOCAL) {
				let authBuffer = Buffer.from(this.localAuthUsername + ':' + this.localAuthPassword);
				options.headers = {
					'Authorization': 'Basic '+ authBuffer.toString('base64')
				};
			}
			// API key auth for cloud binding
			else {
				options.params.api_key = this.cloudAuthAPIkey;
			}

			// Send request
			Axios(options).then((response: any) => {
				
				//Check for errors
				if(response.data.messageType == 'error') {
					reject(new HydrawiseCommandException(response.data.message));
				}

				resolve(response.data);

			}).catch((err: Error) => {
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
	 * @todo Allow using a controller id instead of HydrawiseController object.
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	public commandZone(action: string, zoneOrRelay: number | HydrawiseZone, duration?: number): Promise<any> {
		let that:Hydrawise = this;

		// Get started
		let promise = new Promise((resolve, reject) => {
			let opts: any = {
				period_id : 998,
				action: action,
			};

			// Set Relay number for local binding
			if(that.type == HydrawiseConnectionType.LOCAL) {
				opts.relay = zoneOrRelay instanceof HydrawiseZone ? zoneOrRelay.zone : zoneOrRelay // A zone object, as returned by getZones, or just the relayID can be sent
			} 
			// Set Relay ID for cloud binding
			else {
				opts.relay_id = zoneOrRelay instanceof HydrawiseZone ? zoneOrRelay.relayID : zoneOrRelay // A zone object, as returned by getZones, or just the relayID can be sent
			}

			// Custom duration?
			if(duration !== undefined) {
				opts.custom = duration;
			}

			// Set controller if one was provided (only for cloud)
			if(that.type == HydrawiseConnectionType.CLOUD && zoneOrRelay instanceof HydrawiseZone && zoneOrRelay.controller !== undefined && zoneOrRelay.controller instanceof HydrawiseController) {
				opts.controller_id = zoneOrRelay.controller.id;
			}

			// Execute command
			that.setZone(opts).then((data: any) => {
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
	public commandAllZones(action: string, controller?: HydrawiseController | number, duration?: number): Promise<any> {
		let that = this;

		// Get started
		let promise = new Promise((resolve, reject) => {
			let opts: any = {
				period_id : 998,
				action: action
			}

			// Custom duration?
			if(duration !== undefined) {
				opts.custom = duration;
			}

			// Specific controller? (only cloud)
			if(that.type == HydrawiseConnectionType.CLOUD && controller !== undefined && controller !== null) {
				if(controller instanceof HydrawiseController) {
					opts.controller_id = controller.id;
				}
				else {
					opts.controller_id = controller;
				}
			}

			that.setZone(opts).then(data => {
				resolve(data);
			}).catch((err) => {
				reject(err);
			});
		});
		
		return promise;
	}

	/**
	 * Sends the run command to a single zone/relay
	 * @param {(HydrawiseZone|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	public runZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<any> {
		return this.commandZone('run', zoneOrRelay, duration);
	}

	/**
	 * Sends the run command to all zones/relays
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	public runAllZones(controller?: HydrawiseController, duration?: number): Promise<any> {
		return this.commandAllZones('runall', controller, duration);
	}

	/**
	 * Sends the suspend command to a single zone/relay
	 * @param {(HydrawiseZone|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	public suspendZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<any> {
		return this.commandZone('suspend', zoneOrRelay, duration);
	}

	/**
	 * Sends the suspend command to all zones/relays for a specific controller
	 * @param {number} [duration] - How long should the command be executed
	 * @param {HydrawiseController|number} [controller] - Return zones for a specific controller. If not specified, the zones of the deault controller are returned. 
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	public suspendAllZones(controller?: HydrawiseController, duration?: number): Promise<any> {
		return this.commandAllZones('suspendall', controller, duration);
	}

	/**
	 * Sends the stop command to a single zone/relay
	 * @param {(HydrawiseZone|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	public stopZone(zoneOrRelay: HydrawiseZone | number): Promise<any> {
		return this.commandZone('stop', zoneOrRelay);
	}

	/**
	 * Sends the stop command to all zones/relays
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	public stopAllZones(controller?: HydrawiseController): Promise<any> {
		return this.commandAllZones('stopall', controller);
	}

	/**
	 * Retrieves all zones/relays known to the server
	 * @param {HydrawiseController|number} [controller] - Return zones for a specific controller. If not specified, the zones of the deault controller are returned. 
	 * @return {Promise} A Promise which will be resolved when all zones have been retrieved
	 */
	public getZones(controller?: HydrawiseController | number): Promise<HydrawiseZone[]> {
		let that = this;
	
		// Get started
		let promise: Promise<HydrawiseZone[]> = new Promise((resolve, reject) => {
			
			// Controller set?
			let controllerID;
			if(controller !== undefined && controller !== null) {
				if(controller instanceof HydrawiseController) {
					controllerID = controller.id;
				}
				else {
					controllerID = controller;
				}
			}

			// Get relays
			that.getStatusAndSchedule(controllerID).then((data: any) => {
				let zones:HydrawiseZone[] = [];
				
				// Check every returned relay
				data.relays.map((z: any) => {
					
					// Only configured zones
					if(that.type == HydrawiseConnectionType.CLOUD || z.lastwaterepoch != 0){
					
						// Zone
						let zone: any = {
							apiBinding: that,
							relayID: z.relay_id,
							zone: z.relay,
							name: z.name,
							nextRunAt: new Date((data.time + z.time) * 1000),
							nextRunDuration: z.run || z.run_seconds,
							isSuspended: z.suspended !== undefined && z.suspended == 1,
							isRunning: false,
							remainingRunningTime: 0
						};

						// Link controller to the zones if it was provided when calling the method
						if(controller !== undefined && controller !== null && controller instanceof HydrawiseController) {
							zone.controller = controller;
						}

						// Only available data for local connections
						if(that.type == HydrawiseConnectionType.LOCAL) {
							zone.defaultRunDuration = z.normalRuntime * 60;
						}

						// Running? (local connection)
						if(data.running !== undefined) {
							let runningZone = data.running.find((x: any) => {
								return x.relay_id == z.relay_id;
							});
							if(runningZone != undefined && runningZone != null) {
								zone.isRunning = true;
								zone.remainingRunningTime = runningZone.time_left;
							}
						}

						// Running? (cloud connection)
						if(z.time == 1) {
							zone.isRunning = true;
							zone.remainingRunningTime = z.run;
						}
						
						zones.push(new HydrawiseZone(zone));
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
	 * Retrieves all controllers known to the Hydrawise cloud or returns a single dummy one for a local connection
	 * @return {Promise} A Promise which will be resolved when all controllers have been retrieved
	 */
	public getControllers(): Promise<HydrawiseController[]> {
		let that = this;
	
		// Get started
		let promise: Promise<HydrawiseController[]> = new Promise((resolve, reject) => {
			
			// Cloud
			if(that.type == HydrawiseConnectionType.CLOUD) {
				
				// Get Controllers
				this.getCustomerDetails('controllers').then(data => {
					let controllers: HydrawiseController[] = [];
					
					// Check every returned relay
					data.controllers.map((c: any) => {
						
						// Controller
						let controller: any = {
							apiBinding: that,
							id: c.controller_id,
							name: c.name,
							serialNumber: c.serial_number,
							lastContactWithCloud: new Date(c.last_contact * 1000),
							status: c.status
						};
						
						controllers.push(new HydrawiseController(controller));
					});

					resolve(controllers);
				}).catch((err) => {
					reject(err);
				});
			}
			// Local
			else {
				// Controller
				let controller: any = {
					apiBinding: that,
					name: that.url
				};
				
				resolve([new HydrawiseController(controller)]);
			}

		});

		return promise;
	}



	/* -------- Raw API calls -------- */

	/**
	 * Gets the customer ID & list of available controllers configured in the Hydrawise cloud. Only available in cloud binding.
	 * @param {string} type - Defines the type of customer details to be retrieved alongside the customer ID
	 * @return {Promise} A Promise which will be resolved when the request has returned from the cloud server.
	 */
	public getCustomerDetails(type: string): Promise<any> {
		// Cloud only API
		if (this.type  == HydrawiseConnectionType.LOCAL) { 
			return new Promise((resolve, reject) => {
				reject(new HydrawiseCommandException('Calling Cloud API function on a Local Binding'));
			});
		}
		
		return this.request('customerdetails.php', { type: type });
	}

	/**
	 * Gets the status and schedule of the locally connected controller or all controllers in the cloud 
	 * @param {number} [controller] - Return the status and schedule for a specific controller. If not specified, the zones of the deault controller are returned. 
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	public getStatusAndSchedule(controller?: number): Promise<any> {
		let uri: string = (this.type == HydrawiseConnectionType.LOCAL ? 'get_sched_json.php' : 'statusschedule.php');
		let params: any = {};
	
		// Was a controller set?
		if(controller !== undefined && controller !== null) {
			params.controller_id = controller;
		}

		// If no controller was set
		return this.request(uri, params);
	}

	/**
	 * Sends an action request to a specific or all zones
	 * @param {object} params - Parameters object containing all parameters to be sent along with the request
	 * @param {string} [params.relay_id] - The id of the relay which needs to be targetted. Not needed for runall, suspendall, stopall
	 * @param {string} params.action - The action to be executed: run, stop, suspend, runall, suspendall, stopall
	 * @param {number} [params.custom] - The amount of seconds the action needs to be run. Only for run, suspend, runall, suspendall
	 * @param {number} [controller] - Needs to be specified if you have multiple controllers (cloud only)
	 * @todo Complete params documentation
	 * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
	 */
	public setZone(params: any = {}, controller?: number): Promise<any> {
		if (HydrawiseConnectionType.LOCAL){
			let uri: string = (this.type == HydrawiseConnectionType.LOCAL ? 'set_manual_data.php' : 'setzone.php');
		}
		else
		{
			let uri: string = (this.type == HydrawiseConnectionType.CLOUD ? 'set_manual_data.php' : 'setzone.php');
		}
		
		// Was a controller set?
		if(controller !== undefined && controller !== null) {
			params.controller_id = controller;
		}

		return this.request(uri, params);
	}
}