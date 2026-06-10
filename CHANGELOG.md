# Changelog

## 2.0.2

### Changed

- **LOCAL zone filter removed**: the `type === 110` heuristic (re-added in 2.0.1) is no longer applied. All relay slots returned by the controller are now surfaced to callers without filtering. The `type: 110` value turns out to conflate genuinely-empty/unconfigured relay slots with real valves that simply have no watering schedule assigned — so the library cannot reliably distinguish them. Consumers (e.g. `homebridge-hydrawise`) are now responsible for deciding which relays to hide, typically via an explicit exclude-list in their own config.

## 2.0.1

### Fixed

- **LOCAL zone filter**: real configured zones with `lastwaterepoch === 0` (never watered) were being silently dropped, returning an empty zone list to consumers. Reverted to the original (pre-2020) heuristic of skipping relays with `type === 110`, which is the controller's own marker for unconfigured slots. Regression introduced in commit `eb0fe93` (May 2020); preserved across the v2 rewrite. Fixes `homebridge-hydrawise` showing zero accessories after a controller reset.

### Added

- `RelayRow.type?: number` field on the typed LOCAL response.

## 2.0.0

### Breaking

- Constructor now **throws** on missing required fields (was silent in v1).
- `HydrawiseConfiguration` interface **removed**; use `HydrawiseConfig` (discriminated union: `{type: 'LOCAL', host, password, user?} | {type: 'CLOUD', key}`).
- `commandZone(action, …)` narrowed to single-zone actions: `ZoneAction.Run | ZoneAction.Stop | ZoneAction.Suspend | 'run' | 'stop' | 'suspend'`. Passing an `…All` action is now a compile error.
- `HydrawiseController.id` / `serialNumber` / `lastContactWithCloud` / `status` typed as `… | undefined` (LOCAL controllers don't populate them).
- `HydrawiseZone.controller` typed as `HydrawiseController | undefined`.
- Minimum Node bumped to 18.20.

### Added

- `ZoneAction` enum (`Run`, `Stop`, `Suspend`, `RunAll`, `StopAll`, `SuspendAll`).
- `HydrawiseConfig` discriminated-union config type.
- Typed response interfaces: `LocalStatusResponse`, `CloudStatusResponse`, `CloudCustomerDetailsResponse`, `SetZoneResponse`.
- `HydrawiseController.host` — populated for LOCAL controllers (used by `homebridge-hydrawise` to compute stable accessory keys).
- `HydrawiseZone.defaultRunDuration` is now actually populated for LOCAL zones (was silently dropped by the v1 constructor).
- Vitest suite with fetch-stubbed unit tests (35 cases) covering both LOCAL and CLOUD parsing, command shaping, error handling.

### Changed

- Replaced `axios` with native `fetch`. **Zero runtime dependencies.**
- Internal rewrite: async/await throughout; no more manual Promise wrapping.
- Tightened internal types; eliminated `any` in the API surface.

### Removed

- `axios` runtime dependency.
- Manual `Error.captureStackTrace` fallback (guarded via optional chaining).
