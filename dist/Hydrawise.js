"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hydrawise = void 0;
const HydrawiseConnectionType_1 = require("./HydrawiseConnectionType");
const HydrawiseZone_1 = require("./HydrawiseZone");
const HydrawiseController_1 = require("./HydrawiseController");
const http_1 = require("./http");
const types_1 = require("./types");
const CLOUD_URL = 'https://app.hydrawise.com/api/v1/';
/** Binding to the Hydrawise local controller API or cloud API. */
class Hydrawise {
    type;
    url;
    localAuthUsername;
    localAuthPassword;
    cloudAuthAPIkey;
    config;
    http;
    constructor(options) {
        if (options.type === 'LOCAL') {
            if (!options.host) {
                throw new Error('LOCAL Hydrawise binding requires `host`');
            }
            if (options.password === undefined) {
                throw new Error('LOCAL Hydrawise binding requires `password`');
            }
            const user = options.user ?? 'admin';
            this.config = { type: 'LOCAL', host: options.host, password: options.password, user };
            this.type = HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL;
            this.url = `http://${options.host}/`;
            this.localAuthUsername = user;
            this.localAuthPassword = options.password;
            this.cloudAuthAPIkey = '';
        }
        else if (options.type === 'CLOUD') {
            if (!options.key) {
                throw new Error('CLOUD Hydrawise binding requires `key`');
            }
            this.config = { type: 'CLOUD', key: options.key };
            this.type = HydrawiseConnectionType_1.HydrawiseConnectionType.CLOUD;
            this.url = CLOUD_URL;
            this.localAuthUsername = '';
            this.localAuthPassword = '';
            this.cloudAuthAPIkey = options.key;
        }
        else {
            throw new Error(`Unknown Hydrawise connection type: ${String(options.type)}`);
        }
        this.http = (0, http_1.createHttpClient)(this.config);
    }
    // ---- Raw API ----
    async getStatusAndSchedule(controllerId) {
        const path = this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL ? 'get_sched_json.php' : 'statusschedule.php';
        return this.http.get(path, { controller_id: controllerId });
    }
    async getCustomerDetails(type) {
        if (this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL) {
            throw new Error('Calling Cloud API function on a Local Binding');
        }
        return this.http.get('customerdetails.php', { type });
    }
    async setZone(params, controllerId) {
        const path = this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL ? 'set_manual_data.php' : 'setzone.php';
        return this.http.get(path, controllerId !== undefined ? { ...params, controller_id: controllerId } : params);
    }
    // ---- High-level commands ----
    async commandZone(action, zoneOrRelay, duration) {
        const params = {
            period_id: 998,
            action
        };
        if (this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL) {
            params['relay'] = zoneOrRelay instanceof HydrawiseZone_1.HydrawiseZone ? zoneOrRelay.zone : zoneOrRelay;
        }
        else {
            params['relay_id'] = zoneOrRelay instanceof HydrawiseZone_1.HydrawiseZone ? zoneOrRelay.relayID : zoneOrRelay;
        }
        if (duration !== undefined) {
            params['custom'] = duration;
        }
        let controllerId;
        if (this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.CLOUD &&
            zoneOrRelay instanceof HydrawiseZone_1.HydrawiseZone &&
            zoneOrRelay.controller !== undefined &&
            zoneOrRelay.controller.id !== undefined) {
            controllerId = zoneOrRelay.controller.id;
        }
        return this.setZone(params, controllerId);
    }
    async commandAllZones(action, controller, duration) {
        const params = {
            period_id: 998,
            action
        };
        if (duration !== undefined) {
            params['custom'] = duration;
        }
        let controllerId;
        if (this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.CLOUD && controller !== undefined) {
            controllerId = controller instanceof HydrawiseController_1.HydrawiseController ? controller.id : controller;
        }
        return this.setZone(params, controllerId);
    }
    runZone(zoneOrRelay, duration) {
        return this.commandZone(types_1.ZoneAction.Run, zoneOrRelay, duration);
    }
    stopZone(zoneOrRelay) {
        return this.commandZone(types_1.ZoneAction.Stop, zoneOrRelay);
    }
    suspendZone(zoneOrRelay, duration) {
        return this.commandZone(types_1.ZoneAction.Suspend, zoneOrRelay, duration);
    }
    runAllZones(controller, duration) {
        return this.commandAllZones(types_1.ZoneAction.RunAll, controller, duration);
    }
    stopAllZones(controller) {
        return this.commandAllZones(types_1.ZoneAction.StopAll, controller);
    }
    suspendAllZones(controller, duration) {
        return this.commandAllZones(types_1.ZoneAction.SuspendAll, controller, duration);
    }
    // ---- Hydrated objects ----
    async getZones(controller) {
        const controllerObj = controller instanceof HydrawiseController_1.HydrawiseController ? controller : undefined;
        const controllerId = controller instanceof HydrawiseController_1.HydrawiseController ? controller.id : controller;
        const data = await this.getStatusAndSchedule(controllerId);
        return this.parseZones(data, controllerObj);
    }
    async getControllers() {
        if (this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL) {
            const localConfig = this.config;
            return [
                new HydrawiseController_1.HydrawiseController({
                    apiBinding: this,
                    name: this.url,
                    host: localConfig.host
                })
            ];
        }
        const data = await this.getCustomerDetails('controllers');
        return data.controllers.map((c) => new HydrawiseController_1.HydrawiseController({
            apiBinding: this,
            id: c.controller_id,
            name: c.name,
            serialNumber: c.serial_number,
            lastContactWithCloud: new Date(c.last_contact * 1000),
            status: c.status
        }));
    }
    // ---- Parsing ----
    parseZones(data, controller) {
        const zones = [];
        const running = data.running ?? [];
        for (const z of data.relays) {
            if (this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL && z.lastwaterepoch === 0) {
                continue;
            }
            const init = this.zoneFromRow(z, data.time, running, controller);
            zones.push(new HydrawiseZone_1.HydrawiseZone(init));
        }
        return zones;
    }
    zoneFromRow(z, dataTime, running, controller) {
        const isLocal = this.type === HydrawiseConnectionType_1.HydrawiseConnectionType.LOCAL;
        const init = {
            apiBinding: this,
            relayID: z.relay_id,
            zone: z.relay,
            name: z.name,
            nextRunAt: new Date((dataTime + z.time) * 1000),
            nextRunDuration: z.run ?? z.run_seconds ?? 0,
            isSuspended: z.suspended === 1,
            isRunning: false,
            remainingRunningTime: 0,
            controller,
            defaultRunDuration: isLocal && z.normalRuntime !== undefined ? z.normalRuntime * 60 : undefined
        };
        // Running detection — LOCAL via data.running[], CLOUD via z.time === 1
        if (isLocal) {
            const runningZone = running.find((r) => r.relay_id === z.relay_id);
            if (runningZone !== undefined) {
                init.isRunning = true;
                init.remainingRunningTime = runningZone.time_left;
            }
        }
        else if (z.time === 1) {
            init.isRunning = true;
            init.remainingRunningTime = z.run ?? 0;
        }
        return init;
    }
}
exports.Hydrawise = Hydrawise;
//# sourceMappingURL=Hydrawise.js.map