/**
 * @author Martijn Dierckx - Complete rewrite to service both the cloud & local API binding
 * @author Paul Molluzzo (https://paulmolluzzo.com) - Initial 0.1.0 version containing the cloud binding
 */
import { HydrawiseConnectionType } from './HydrawiseConnectionType';
import { HydrawiseZone } from './HydrawiseZone';
import { HydrawiseController } from './HydrawiseController';
interface HydrawiseConfiguration {
    type: HydrawiseConnectionType;
    host?: string;
    user?: string;
    password?: string;
    key?: string;
}
/** Class representing a Hydrawise local or cloud based API binding */
export declare class Hydrawise {
    private readonly cloudUrl;
    type: HydrawiseConnectionType;
    url: string;
    localAuthUsername: string;
    localAuthPassword: string;
    cloudAuthAPIkey: string;
    /**
     * Create a new instance of the Hydrawise API binding
     * @param {object} options - Options object containing all parameters
     * @param {string} options.type - The type of binding you wish to make: 'CLOUD' or 'LOCAL'
     * @param {string} [options.host] - The hostname or ip address of the local host you wish to connect to. Only needed for local bindings.
     * @param {string} [options.user = admin] - The username of the local Hydrawise controller. Only needed for local bindings (falls back to the default 'admin' user).
     * @param {string} [options.password] - The password of the local Hydrawise controller. Only needed for local bindings.
     * @param {string} [options.key] - The API key of your Hydrawise cloud account. Only needed for cloud bindings.
     */
    constructor(options: HydrawiseConfiguration);
    /**
     * Private function that makes a GET request to the local or cloud Hydrawise server
     * @param {string} path - The path of the API endpoint
     * @param {object} [params] - Parameters to be added to the URL path
     * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
     */
    private request;
    /**
     * Sends a command to a single zone/relay
     * @param {string} action - The required command to be executed for the given zone/relay: run, suspend, stop
     * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @param {number} [duration] - How long should the command be executed (only applicable for run & suspend)
     * @todo Check whether controller_id needs to sent when the account contains multiple zones
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    commandZone(action: string, zoneOrRelay: number | HydrawiseZone, duration?: number): Promise<any>;
    /**
     * Sends a command to all zones/relays
     * @param {string} action - The required command to be executed: runall, suspendall, stopall
     * @param {number} [duration] - How long should the given command be executed (only applicable for runall & suspendall)
     * @todo Check whether controller_id needs to sent when the account contains multiple zones
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    commandAllZones(action: string, duration?: number): Promise<any>;
    /**
     * Sends the run command to a single zone/relay
     * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    runZone(zoneOrRelay: number | HydrawiseZone, duration?: number): Promise<any>;
    /**
     * Sends the run command to all zones/relays
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    runAllZones(duration?: number): Promise<any>;
    /**
     * Sends the suspend command to a single zone/relay
     * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    suspendZone(zoneOrRelay: number | HydrawiseZone, duration?: number): Promise<any>;
    /**
     * Sends the suspend command to all zones/relays
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    suspendAllZones(duration?: number): Promise<any>;
    /**
     * Sends the stop command to a single zone/relay
     * @param {(HydrawiseZone|number|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopZone(zoneOrRelay: number | HydrawiseZone): Promise<any>;
    /**
     * Sends the stop command to all zones/relays
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopAllZones(): Promise<any>;
    /**
     * Retrieves all zones/relays known to the server
     * @param {boolean} [onlyConfigured = true] - Only return zones/relays which have been configured
     * @return {Promise} A Promise which will be resolved when all zones have been retrieved
     */
    getZones(onlyConfigured?: boolean): Promise<HydrawiseZone[]>;
    /**
     * Retrieves all controllers known to the Hydrawise cloud
     * @return {Promise} A Promise which will be resolved when all controllers have been retrieved
     */
    getControllers(): Promise<HydrawiseController[]>;
    /**
     * Gets the customer ID & list of available controllers configured in the Hydrawise cloud. Only available in cloud binding.
     * @param {string} type - Defines the type of customer details to be retrieved alongside the customer ID
     * @return {Promise} A Promise which will be resolved when the request has returned from the cloud server.
     */
    getCustomerDetails(type: string): Promise<any>;
    /**
     * Gets the status and schedule of the locally connected controller or all controllers in the cloud
     * @param {string} type - Defines the type of customer details to be retrieved alongside the customer ID
     * @todo Check whether controller_id needs to sent when the account contains multiple zones
     * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
     */
    getStatusAndSchedule(tag?: string, hours?: string): Promise<any>;
    /**
     * Sends an action request to a specific or all zones
     * @param {object} params - Parameters object containing all parameters to be sent along with the request
     * @param {string} params.action - The action to be executed: run, stop, suspend, runall, suspendall, stopall
     * @todo Complete params documentation
     * @todo Check whether controller_id needs to sent when the account contains multiple zones
     * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
     */
    setZone(this: Hydrawise, params?: any): Promise<any>;
    /**
     * Does the same as getCustomerDetails, and is only kept to be backwards compatible with version 0.1.0 of this module
     * @param {string} [type = controllers] - Defines the type of customer details to be retrieved alongside the customer ID
     * @alias getCustomerDetails
     * @return {Promise} A Promise which will be resolved when the request has returned from the cloud server.
     */
    customerdetails(type?: string): Promise<any>;
    /**
     * Does the same as getCustomerDetails, and is only kept to be backwards compatible with version 0.1.0 of this module
     * @alias getStatusAndSchedule
     * @deprecated since version 1.0.0. Please use getZones()
     * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
     */
    statusschedule(tag?: string, hours?: string): Promise<any>;
    /**
     * Does the same as setZone, and is only kept to be backwards compatible with version 0.1.0 of this module
     * @alias setZone
     * @deprecated since version 1.0.0. Please use runZone(), suspendZone(), stopZone(), runAllZones(), suspendAllZones(), stopAllZones() or the run(), suspend(), stop() commands on a HydrawiseZone object.
     * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
     */
    setzone(params?: any): Promise<any>;
}
export {};
//# sourceMappingURL=Hydrawise.d.ts.map