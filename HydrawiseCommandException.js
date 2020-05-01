'use strict';
/**
 * @author Martijn Dierckx
 */

/** Class representing a specifc error triggered by the Hydrawise API binding */
class HydrawiseCommandException extends Error {
	constructor(message, ...params) {
		super(...params);

		Error.captureStackTrace(this, HydrawiseCommandException);

		this.name = 'HydrawiseCommandException';
		this.message = message;
		this.date = new Date();
	}
}

module.exports = (message, ...params) => {
	return new HydrawiseCommandException(message, ...params);
};