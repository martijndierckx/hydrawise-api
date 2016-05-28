'use strict';

const rp = require('request-promise');

class Hydrawise {
  constructor(key) {
    this.url = 'https://hydrawise.com/api/v1/';
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

  statusschedule(tag = '', hours = '168') {
    return this.request('GET', 'statusschedule', {tag, hours});
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
