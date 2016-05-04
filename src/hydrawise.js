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

    options.qs = {...params};
    options.qs.api_key = this.api_key;
    return rp(options);
  }

  customerdetails() {
    return this.request('GET', 'customerdetails', {type: 'controllers'});
  }

  statusschedule(tag = '', hours = 168) {
    return this.request('GET', 'statusschedule', {tag, hours});
  }
}

export default Hydrawise;
