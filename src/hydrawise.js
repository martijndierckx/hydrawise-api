'use strict';

import rp from 'request-promise';

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

    options.qs = {api_key: this.api_key, ...params};
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

  setzone(action, params) {
    return this.request('GET', 'setzone', {action, ...params});
  }
}

export default Hydrawise;
