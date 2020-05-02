/**
 * @author Martijn Dierckx
 */

import { Hydrawise } from "./Hydrawise";

/** Class representing a Hydrawise zone */
export class HydrawiseZone {

	public apiBinding: Hydrawise;
	public relayID: number;
	public zone: number;
	public name: string;
	public nextRunAt: Date;
	public nextRunDuration: number;
	public isSuspended: boolean;
	public isRunning: boolean;
	public remainingRunningTime: number;

	/**
	 * Create a new instance of a HydrawiseZone
	 * @param {object} options - Options object containing all parameters
	 * @param {Hydrawise} options.apiBinding - The API binding which can be used to execute commands on the zone
	 * @param {number} options.relayID - The unique relay number known to the Hydrawise cloud
	 * @param {number} options.zone - The local zone/relay number
	 * @param {string} options.name - The name of the zone
	 * @param {Date} options.nextRunAt - The date & time of the next scheduled run 
	 * @param {number} options.nextRunDuration - Run time in seconds of the next run defined by nextRunAt
	 * @param {boolean} options.isSuspended - Returns true when the zoneis currently suspended
	 * @param {boolean} options.isRunning - Returns true when the zone is actively running
	 * @param {number} options.remainingRunningTime - Remaining run time in seconds when isRunning = true
	 */
	constructor(options: any) {
		this.apiBinding = options.apiBinding;
		this.relayID = options.relayID;
		this.zone = options.zone;
		this.name = options.name;
		this.nextRunAt = options.nextRunAt;
		this.nextRunDuration = options.nextRunDuration;
		this.isSuspended = options.isSuspended;
		this.isRunning = options.isRunning;
		this.remainingRunningTime = options.remainingRunningTime;
	}

	/**
	 * Sends the run command to the zone/relay
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	run(duration: number): Promise<any> {
		return this.apiBinding.commandZone('run', this, duration);
	}

	/**
	 * Sends the stop command to the zone/relay
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	stop(): Promise<any> {
		return this.apiBinding.commandZone('stop', this);
	}

	/**
	 * Sends the suspend command to the zone/relay
	 * @param {number} [duration] - How long should the command be executed
	 * @return {Promise} A Promise which will be resolved when the command has been executed.
	 */
	suspend(duration: number): Promise<any> {
		return this.apiBinding.commandZone('suspend', this, duration);
	}
}