'use strict';

const rp = require('request-promise');

class Hydrawise {
  constructor(key) {
    this.url = 'https://app.hydrawise.com/api/v1/';
    this.api_key = key;
  }

  request(method = 'GET', url = '', params = {}) {
    const options = {
      method,
      uri: `${this.url}${url}.php`,
      json: true
    };

    options.qs = params;
    options.qs.api_key = this.api_key;
    return rp(options);
  }

  customerdetails() {
    return this.request('GET', 'customerdetails', {type: 'controllers'});
  }

  statusschedule(controller_id = null, hours = '168') {
    const params = {hours};
    if (controller_id) {
      params.controller_id = controller_id;
    }

    return this.request('GET', 'statusschedule', params);
  }

  setcontroller(controllerid) {
    return this.request('GET', 'setcontroller', {controllerid, json: true});
  }

  setzone(action, params = {}) {
    params.action = action;
    return this.request('GET', 'setzone', params);
  }
}

module.exports = apiKey => {
  return new Hydrawise(apiKey);
};
