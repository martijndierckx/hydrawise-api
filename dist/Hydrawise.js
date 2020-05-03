"use strict";
/**
 * @author Martijn Dierckx - Complete rewrite to service both the cloud & local API binding
 * @author Paul Molluzzo (https://paulmolluzzo.com) - Initial 0.1.0 version containing the cloud binding
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HydrawiseConnectionType_1 = require("./HydrawiseConnectionType");
const HydrawiseZone_1 = require("./HydrawiseZone");
const HydrawiseController_1 = require("./HydrawiseController");
const HydrawiseCommandException_1 = require("./HydrawiseCommandException");
const axios_1 = __importDefault(require("axios"));
/** Class representing a Hydrawise local or cloud based API binding */
class Hydrawise {
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
        this.cloudUrl = 'https://app.hydrawise.com/api/v1/';
        this.type = options.type || HydrawiseConnectionType_1.HydrawiseConnectionType.CLOUD; // CLOUD or LOCAL 
        this.url = (this.type == HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL ? 'http://' + options.host + '/' : this.cloudUrl);
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
    request(path = '', params = {}) {
        let promise = new Promise((resolve, reject) => {
            // setup basic request
            let options = {
                method: 'get',
                url: this.url + path,
                params: params,
                json: true
            };
            // Basic auth for local binding
            if (this.type == HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL) {
                let authBuffer = Buffer.from(this.localAuthUsername + ':' + this.localAuthPassword);
                options.headers = {
                    'Authorization': 'Basic ' + authBuffer.toString('base64')
                };
            }
            // API key auth for cloud binding
            else {
                options.params.api_key = this.cloudAuthAPIkey;
            }
            // Send request
            axios_1.default(options).then((response) => {
                //Check for errors
                if (response.data.messageType == 'error') {
                    reject(new HydrawiseCommandException_1.HydrawiseCommandException(response.data.message));
                }
                resolve(response.data);
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
                period_id: 998,
                action: action,
            };
            // Set Relay number for local binding
            if (that.type == HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL) {
                opts.relay = typeof zoneOrRelay == 'object' ? zoneOrRelay.zone : zoneOrRelay; // A zone object, as returned by getZones, or just the relayID can be sent
            }
            // Set Relay ID for cloud binding
            else {
                opts.relay_id = typeof zoneOrRelay == 'object' ? zoneOrRelay.relayID : zoneOrRelay; // A zone object, as returned by getZones, or just the relayID can be sent
            }
            // Custom duration?
            if (duration !== undefined) {
                opts.custom = duration;
            }
            // Execute command
            that.setZone(opts).then((data) => {
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
                period_id: 998,
                action: action
            };
            // Custom duration?
            if (duration !== undefined) {
                opts.custom = duration;
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
        return this.commandAllZones('runall', duration);
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
        return this.commandAllZones('suspendall', duration);
    }
    /**
     * Sends the stop command to a single zone/relay
     * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopZone(zoneOrRelay) {
        return this.commandZone('stop', zoneOrRelay);
    }
    /**
     * Sends the stop command to all zones/relays
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopAllZones() {
        return this.commandAllZones('stopall');
    }
    /**
     * Retrieves all zones/relays known to the server
     * @param {boolean} [onlyConfigured = true] - Only return zones/relays which have been configured
     * @return {Promise} A Promise which will be resolved when all zones have been retrieved
     */
    getZones() {
        let that = this;
        // Get started
        let promise = new Promise((resolve, reject) => {
            // Get relays
            that.getStatusAndSchedule().then((data) => {
                let zones = [];
                // Check every returned relay
                data.relays.map((z) => {
                    // Only configured zones
                    if (that.type == HydrawiseConnectionType_1.HydrawiseConnectionType.CLOUD || z.lastwaterepoch != 0) {
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
                        if (that.type == HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL) {
                            zone.defaultRunDuration = z.normalRuntime * 60;
                        }
                        // Running?
                        if (data.running !== undefined) {
                            let runningZone = data.running.find((x) => {
                                return x.relay_id == z.relay_id;
                            });
                            if (runningZone != undefined && runningZone != null) {
                                zone.isRunning = true;
                                zone.remainingRunningTime = runningZone.time_left;
                            }
                        }
                        zones.push(new HydrawiseZone_1.HydrawiseZone(zone));
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
                data.controllers.map((c) => {
                    // Zone
                    let controller = {
                        id: c.controller_id,
                        name: c.name,
                        serialNumber: c.serial_number,
                        lastContactWithCloud: new Date(c.last_contact * 1000),
                        status: c.status
                    };
                    controllers.push(new HydrawiseController_1.HydrawiseController(controller));
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
        if (this.type == HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL) {
            return new Promise((resolve, reject) => {
                reject(new HydrawiseCommandException_1.HydrawiseCommandException('Calling Cloud API function on a Local Binding'));
            });
        }
        return this.request('customerdetails.php', { type: type });
    }
    /**
     * Gets the status and schedule of the locally connected controller or all controllers in the cloud
     * @param {string} type - Defines the type of customer details to be retrieved alongside the customer ID
     * @todo Check whether controller_id needs to sent when the account contains multiple zones
     * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
     */
    getStatusAndSchedule(tag = '', hours = '168') {
        let uri = (this.type == HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL ? 'get_sched_json.php' : 'statusschedule.php');
        return this.request(uri, { tag, hours });
    }
    /*setController(controllerID: number): Promise<any> {
        // Cloud only API
        if (this.type  == HydrawiseConnectionType.LOCAL) {
            return new Promise((resolve, reject) => {
                reject(new HydrawiseCommandException('Calling Cloud API function on a Local Binding'));
            });
        }
        
        return this.request('setcontroller.php', { controllerID, json: true });
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
        let uri = (this.type == HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL ? 'set_manual_data.php' : 'setzone.php');
        return this.request(uri, params);
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
exports.Hydrawise = Hydrawise;
//# sourceMappingURL=Hydrawise.js.map