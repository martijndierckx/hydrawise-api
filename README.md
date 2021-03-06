# Hydrawise API

[![Build Status](https://travis-ci.org/paulmolluzzo/hydrawise-api.svg?branch=master)](https://travis-ci.org/paulmolluzzo/hydrawise-api)

This is a client for the [Hydrawise API](https://support.hydrawise.com/hc/en-us/articles/360008965753-Hydrawise-API-Information). [Hydrawise](https://hydrawise.com) is an internet-controlled home irrigation system.

On a very basic level, it allows you to do:
* [Get controllers](#get-controllers)
* [Get zones](#get-zones)
* [Run a command on a zone](#run-a-command-on-a-zone) (run/stop/suspend)
* [Command all zones at once](#command-all-zones-at-once)

For all possibilities, have a look at the inline code documentation

## Getting started

When possible use a local connection to your controller since it's not rate limited (HTTP error 429) and suffers no delays when trying to run commands on zones.
Local connections are only possible on firmware versions below v3.0.0 however.

### Setup for a cloud connection

```js
const Hydrawise = require('hydrawise-api').Hydrawise;
const myHydrawise = new Hydrawise({ type:'CLOUD', key:'YOUR_API_KEY' });
```

You can obtain your API key from the "Account Details" screen on the [Hydrawise platform](https://app.hydrawise.com/config/account/details)

### Setup for a local connection

```js
const Hydrawise = require('hydrawise-api').Hydrawise;
const myHydrawise = new Hydrawise({ type:'LOCAL', host:'HOSTNAME_OR_IP_ADDRESS', password:'YOUR_CONTROLLER_PASSWORD' });
```

You can also provide a *user* parameter, but this should be 'admin' in most cases.

## Basic usage

### Get Controllers

If you have multiple controllers you can use this function to retrieve them all. Once you know your controllers, you're able to get and/or command the connected zones to that controller.

```js
myHydrawise.getControllers()
  .then(controllers => console.log(controllers))
  .catch(error => console.log(error));
```

### Get Zones

Get all zones and see their status.

If you only have a single controller, you can get the list of zones without first retrieving your controller details:

```js
myHydrawise.getZones()
  .then(zones => console.log(zones))
  .catch(error => console.log(error));
```

If you have multiple controllers you should first get your list of controllers and request the zones list for that specific controller (if you don't you only get the zones of your 'default' controller.):

```js
myHydrawise.getControllers()
  .then((controllers) => {
    // Get the zones for the first returned controller
    controllers[0].getZones()
    .then(zones => console.log(zones))
    .catch(error => console.log(error));
  })
  .catch(error => console.log(error));
```

This will return an array of HydrawiseZone objects containing the following info:

```js
{number} relayID - The unique relay number known to the Hydrawise cloud
{number} zone - The local zone/relay number
{string} name - The name of the zone
{Date} nextRunAt - The date & time of the next scheduled run 
{number} nextRunDuration - Run time in seconds of the next run defined by nextRunAt
{boolean} isSuspended - Returns true when the zoneis currently suspended
{boolean} isRunning - Returns true when the zone is actively running
{number} remainingRunningTime - Remaining run time in seconds when isRunning = true
```

### Run a command on a zone

You can execute a couple of basic commands on each zone: `run()`, `suspend()` or `stop()`

```js
myHydrawise.getZones()
  .then(zones => {
    // Run the first returned zone  
    zone[0].run().then((info) => {
      console.log('success');
    }).catch(error => console.log(error));
  }).catch(error => console.log(error));
```

For the run & suspend commands you are able to provide a custom duration in seconds: `run(600)` (for 10 mins).
If no custom duration was provided, the default run time configured for the zone will be used. 

Zones can also be commanded directly from the Hydrawise object:

```js
myHydrawise.runZone(1) - Run by local zone number (only. for local bindings)
myHydrawise.runZone(123123) - Run by unique relay ID (only. for cloud bindings)
myHydrawise.runZone(myHydrawiseZoneObject) - Run by the HydrawiseZone object returned by getZones()
```

### Command all zones at once

It's also possible to command all zones at the same time:

```js
myHydrawise.runAllZones()
  .then(info => {
     console.log('success');
  }).catch(error => console.log(error));
```

Here as well, you are able to provide a custom duration: `runAllZones(600)` (for 10 mins).

------

## Contributors

* Martijn Dierckx - Complete rewrite to service both the cloud & local API binding in TypeScript
* [Paul Molluzzo](https://paul.molluzzo.com) - Initial 0.1.0 version containing the cloud binding

Tested on a configuration with a single HC6 controller. If you have multiple controllers in your configuration and you run into problems, you're free to create an issue or contribute yourself :-)

MIT license