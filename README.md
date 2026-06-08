# Hydrawise API

A TypeScript client for the [Hydrawise API](https://support.hydrawise.com/hc/en-us/articles/360008965753-Hydrawise-API-Information) — both cloud-based and direct local-network bindings. [Hydrawise](https://hydrawise.com) is an internet-controlled home irrigation system.

Zero runtime dependencies (uses native `fetch`).

What you can do:

- [Get controllers](#get-controllers)
- [Get zones](#get-zones)
- [Run a command on a zone](#run-a-command-on-a-zone) (run / stop / suspend)
- [Command all zones at once](#command-all-zones-at-once)

## Getting started

When possible use a local connection to your controller: it isn't rate limited (no HTTP 429s) and suffers no delays for zone commands. Local connections require controller firmware below v3.0.0.

### Setup — cloud

```ts
import { Hydrawise } from 'hydrawise-api';

const hydrawise = new Hydrawise({ type: 'CLOUD', key: 'YOUR_API_KEY' });
```

Get your API key from "Account Details" on the [Hydrawise platform](https://app.hydrawise.com/config/account/details).

### Setup — local

```ts
import { Hydrawise } from 'hydrawise-api';

const hydrawise = new Hydrawise({
  type: 'LOCAL',
  host: 'HOSTNAME_OR_IP_ADDRESS',
  password: 'YOUR_CONTROLLER_PASSWORD'
  // user: 'admin'   // optional, defaults to admin
});
```

## Basic usage

### Get controllers

If you have multiple controllers, fetch them first and then operate on the one you need.

```ts
const controllers = await hydrawise.getControllers();
```

### Get zones

If you have a single controller you can skip the controllers fetch:

```ts
const zones = await hydrawise.getZones();
```

For multi-controller setups, fetch zones from a specific controller:

```ts
const controllers = await hydrawise.getControllers();
const zones = await controllers[0].getZones();
```

Each `HydrawiseZone` carries:

| Field | Type | Notes |
|---|---|---|
| `relayID` | `number` | Unique relay ID known to the Hydrawise cloud. |
| `zone` | `number` | Local zone/relay number on the controller. |
| `name` | `string` | Zone display name. |
| `nextRunAt` | `Date` | Next scheduled run. |
| `nextRunDuration` | `number` | Run time (seconds) for the next scheduled run. |
| `isSuspended` | `boolean` | True when the zone is currently suspended. |
| `isRunning` | `boolean` | True when the zone is actively running. |
| `remainingRunningTime` | `number` | Seconds remaining when `isRunning`. |
| `controller` | `HydrawiseController \| undefined` | Set when the zone was fetched via a specific controller. |
| `defaultRunDuration` | `number \| undefined` | LOCAL only: the controller's configured default run time, in seconds. |

### Run a command on a zone

Use `run()`, `suspend()`, or `stop()` on a `HydrawiseZone`:

```ts
const zones = await hydrawise.getZones();
await zones[0].run();        // default duration
await zones[0].run(600);     // 10 minutes
await zones[0].suspend(300); // suspend 5 minutes
await zones[0].stop();
```

Or command directly via the binding:

```ts
await hydrawise.runZone(1);              // by local zone number (LOCAL)
await hydrawise.runZone(2001);           // by relay_id (CLOUD)
await hydrawise.runZone(zone);           // by HydrawiseZone object
```

For type safety, prefer the `ZoneAction` enum when calling the low-level commands:

```ts
import { ZoneAction } from 'hydrawise-api';
await hydrawise.commandZone(ZoneAction.Run, 1, 600);
```

Legacy string actions (`'run'`, `'stop'`, `'suspend'`) are still accepted.

### Command all zones at once

```ts
await hydrawise.runAllZones();           // all zones, default duration
await hydrawise.runAllZones(600);        // all zones for 10 minutes
await hydrawise.stopAllZones();
await hydrawise.suspendAllZones(controllers[0], 300);
```

## Migration from v1

v2 is a breaking release. The migration is mechanical and the public API surface is otherwise stable.

**1. Constructor now throws on missing required fields.**

```ts
// v1: silently created a broken instance
new Hydrawise({ type: 'CLOUD' });

// v2: throws
new Hydrawise({ type: 'CLOUD' });  // Error: CLOUD Hydrawise binding requires `key`
```

This is a latent-bug-finder, not a behavior change for callers that already passed the right fields.

**2. Discriminated-union config type.**

The `HydrawiseConfiguration` interface is **removed** and replaced by `HydrawiseConfig`:

```ts
type HydrawiseConfig =
  | { type: 'LOCAL'; host: string; password: string; user?: string }
  | { type: 'CLOUD'; key: string };
```

If you typed your config object with `HydrawiseConfiguration`, switch to `HydrawiseConfig`. The runtime constructor still accepts a loose object (so plain object literals continue to work).

**3. `commandZone` and `commandAllZones` action parameter is now typed.**

Both an exported `ZoneAction` enum and legacy string literals are accepted. The single-zone command (`commandZone`) only accepts single-zone actions (`Run`/`Stop`/`Suspend`); passing an `…All` action is now a compile error.

```ts
import { ZoneAction } from 'hydrawise-api';
await hydrawise.commandZone(ZoneAction.Run, 1, 600);   // preferred
await hydrawise.commandZone('run', 1, 600);            // still works
```

**4. `HydrawiseController.id` / `serialNumber` typed as optional.**

LOCAL controllers never had these values; v1 falsely typed them as required. Code that reads them on LOCAL controllers must now handle `undefined`.

**5. New `HydrawiseController.host` field (LOCAL only).**

Carries the raw configured host (e.g. `192.168.1.10`). Consumers (like `homebridge-hydrawise`) use this to derive a stable identifier for LOCAL controllers.

**6. `HydrawiseZone.controller` typed as optional.**

Matches the v1 runtime behavior: only set when zones were fetched via a specific controller.

**7. `defaultRunDuration` is now actually populated (LOCAL only).**

In v1, the field was advertised but the `HydrawiseZone` constructor silently dropped it. v2 wires it through.

**8. Zero runtime dependencies.**

Axios is gone — v2 uses native `fetch`. Minimum runtime: Node 18.20.

## Contributors

- Martijn Dierckx — TypeScript rewrite + v2 modernization.
- [Paul Molluzzo](https://paul.molluzzo.com) — initial 0.1.0 (cloud binding).

MIT license.
