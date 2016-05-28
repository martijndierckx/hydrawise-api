# Hydrawise API

[![Build Status](https://travis-ci.org/paulmolluzzo/hydrawise-api.svg?branch=master)](https://travis-ci.org/paulmolluzzo/hydrawise-api)

This is a client for the [Hydrawise API](https://hydrawise.com/support/using-api/). [Hydrawise](https://hydrawise.com) is an internet-controlled home irrigation system.

It provides access to the following endpoints:
* [Customer Details](#customer-details)
* [Status Schedule](#status-schedule)
* [Set Controller](#set-controller)
* [Set Zone](#set-zone)

## Usage

### Initial Setup

```js
const Hydrawise = require('hydrawise-api');
const myHydrawise = Hydrawise(YOUR_API_KEY);
```

### Customer Details

Get cusetomer info.

```js
myHydrawise.customerdetails()
  .then(data => console.log(data))
  .catch(error => console.log(error));
```

### Status Schedule

Get the status of a controller. You can pass the param `hydrawise_all` or a specific tag or leave empty for the current controller. The second parameter is how far in advance (in hours) you want to get the schedule, and it will default to the maximum of 168.

```js
myHydrawise.statusschedule()
  .then(data => console.log(data))
  .catch(error => console.log(error));
```

### Set Controller

Set a controller for controller-specific commands.

**_Note: This endpoint seems to not respond with any data, so a non-error is a "pass" I guess?_**

```js
myHydrawise.setcontroller(controller_id)
  .then()
  .catch(error => console.log(error));
```

### Set Zone

This is how you set a zone to run, suspend, or stop. The params are an action and additional params `period_id`, `custom` for a duration in seconds, and `relay_id` for a specific zone.

```js
// run all for 10 minutes
myHydrawise.setzone('runall', {period_id: '666', custom: '600'})
  .then(data => console.log(data))
  .catch(error => console.log(error));

// stop all
myHydrawise.setzone('stopall')
  .then(data => console.log(data))
  .catch(error => console.log(error));

// run zone for 5 minutes
myHydrawise.setzone('run', {period_id: '123', custom: '300', relay_id: your_relay_id})
  .then(data => console.log(data))
  .catch(error => console.log(error));
```

------

MIT

©2016 Paul Molluzzo
