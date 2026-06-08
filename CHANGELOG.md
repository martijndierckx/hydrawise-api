# Changelog

## 2.0.0 (unreleased)

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
