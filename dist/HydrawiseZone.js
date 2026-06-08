"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydrawiseZone = void 0;
/** A Hydrawise zone/relay (sprinkler valve). */
class HydrawiseZone {
    apiBinding;
    relayID;
    zone;
    name;
    nextRunAt;
    nextRunDuration;
    isSuspended;
    isRunning;
    remainingRunningTime;
    controller;
    defaultRunDuration;
    constructor(init) {
        this.apiBinding = init.apiBinding;
        this.relayID = init.relayID;
        this.zone = init.zone;
        this.name = init.name;
        this.nextRunAt = init.nextRunAt;
        this.nextRunDuration = init.nextRunDuration;
        this.isSuspended = init.isSuspended;
        this.isRunning = init.isRunning;
        this.remainingRunningTime = init.remainingRunningTime;
        this.controller = init.controller;
        this.defaultRunDuration = init.defaultRunDuration;
    }
    run(duration) {
        return this.apiBinding.commandZone('run', this, duration);
    }
    stop() {
        return this.apiBinding.commandZone('stop', this);
    }
    suspend(duration) {
        return this.apiBinding.commandZone('suspend', this, duration);
    }
}
exports.HydrawiseZone = HydrawiseZone;
//# sourceMappingURL=HydrawiseZone.js.map