"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydrawiseCommandException = void 0;
/** Specific error thrown by the Hydrawise API binding when the server replies with messageType === 'error'. */
class HydrawiseCommandException extends Error {
    date;
    constructor(message) {
        super(message);
        this.name = 'HydrawiseCommandException';
        this.date = new Date();
        Error.captureStackTrace?.(this, HydrawiseCommandException);
    }
}
exports.HydrawiseCommandException = HydrawiseCommandException;
//# sourceMappingURL=HydrawiseCommandException.js.map