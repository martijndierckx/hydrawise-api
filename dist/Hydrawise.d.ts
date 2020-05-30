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
     * @todo Allow using a controller id instead of HydrawiseController object.
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
    commandAllZones(action: string, controller?: HydrawiseController | number, duration?: number): Promise<any>;
    /**
     * Sends the run command to a single zone/relay
     * @param {(HydrawiseZone|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    runZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<any>;
    /**
     * Sends the run command to all zones/relays
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    runAllZones(controller?: HydrawiseController, duration?: number): Promise<any>;
    /**
     * Sends the suspend command to a single zone/relay
     * @param {(HydrawiseZone|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @param {number} [duration] - How long should the command be executed
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    suspendZone(zoneOrRelay: HydrawiseZone | number, duration?: number): Promise<any>;
    /**
     * Sends the suspend command to all zones/relays for a specific controller
     * @param {number} [duration] - How long should the command be executed
     * @param {HydrawiseController|number} [controller] - Return zones for a specific controller. If not specified, the zones of the deault controller are returned.
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    suspendAllZones(controller?: HydrawiseController, duration?: number): Promise<any>;
    /**
     * Sends the stop command to a single zone/relay
     * @param {(HydrawiseZone|number)} zoneOrRelay - The zone/relay you are targetting. Can be a zone object returned by getZones, a relay number (zone.zone) for local bindings or a relayID (zone.relayID) for cloud bindings
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopZone(zoneOrRelay: HydrawiseZone | number): Promise<any>;
    /**
     * Sends the stop command to all zones/relays
     * @return {Promise} A Promise which will be resolved when the command has been executed.
     */
    stopAllZones(controller?: HydrawiseController): Promise<any>;
    /**
     * Retrieves all zones/relays known to the server
     * @param {HydrawiseController|number} [controller] - Return zones for a specific controller. If not specified, the zones of the deault controller are returned.
     * @return {Promise} A Promise which will be resolved when all zones have been retrieved
     */
    getZones(controller?: HydrawiseController | number): Promise<HydrawiseZone[]>;
    /**
     * Retrieves all controllers known to the Hydrawise cloud or returns a single dummy one for a local connection
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
     * @param {number} [controller] - Return the status and schedule for a specific controller. If not specified, the zones of the deault controller are returned.
     * @return {Promise} A Promise which will be resolved when the request has returned from the local or cloud server.
     */
    getStatusAndSchedule(controller?: number): Promise<any>;
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
    setZone(params?: any, controller?: number): Promise<any>;
}
export {};
//# sourceMappingURL=Hydrawise.d.ts.map