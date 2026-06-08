"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydrawiseController = void 0;
/** A Hydrawise controller. */
class HydrawiseController {
    apiBinding;
    name;
    id;
    serialNumber;
    lastContactWithCloud;
    status;
    /** Host (e.g. `192.168.1.10`) — only set on LOCAL controllers. Used by consumers to derive stable identifiers. */
    host;
    constructor(init) {
        this.apiBinding = init.apiBinding;
        this.name = init.name;
        this.id = init.id;
        this.serialNumber = init.serialNumber;
        this.lastContactWithCloud = init.lastContactWithCloud;
        this.status = init.status;
        this.host = init.host;
    }
    getZones() {
        return this.apiBinding.getZones(this);
    }
    runAllZones(duration) {
        return this.apiBinding.commandAllZones('runall', this, duration);
    }
    stopAllZones() {
        return this.apiBinding.commandAllZones('stopall', this);
    }
    suspendAllZones(duration) {
        return this.apiBinding.commandAllZones('suspendall', this, duration);
    }
}
exports.HydrawiseController = HydrawiseController;
//# sourceMappingURL=HydrawiseController.js.map