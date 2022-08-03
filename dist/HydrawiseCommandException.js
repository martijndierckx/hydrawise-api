"use strict";
/**
 * @author Martijn Dierckx
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydrawiseCommandException = void 0;
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
exports.HydrawiseCommandException = HydrawiseCommandException;
//# sourceMappingURL=HydrawiseCommandException.js.map