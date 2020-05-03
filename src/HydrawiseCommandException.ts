/**
 * @author Martijn Dierckx
 */

/** Class representing a specifc error triggered by the Hydrawise API binding */
export class HydrawiseCommandException extends Error {
	
	public date: Date;

	constructor(message: string, ...params:any) {
		super(...params);

		Error.captureStackTrace(this, HydrawiseCommandException);

		this.name = 'HydrawiseCommandException';
		this.message = message;
		this.date = new Date();
	}
}