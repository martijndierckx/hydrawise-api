const test = require('ava');
const hydrawise = require('../index');

const h = hydrawise('53DC-7E24-07E8-CD7D');

test('Customer Details', t => {
  return h.customerdetails().then(data => {
    if (data.error_msg) {
      t.fail(`Error: ${data.error_msg}`);
    }
    t.pass();
  });
});

test('Status Schedule', t => {
  return h.statusschedule().then(data => {
    if (data.error_msg) {
      t.fail(`Error: ${data.error_msg}`);
    }
    t.pass();
  });
});

test('Status Schedule All', t => {
  return h.statusschedule('hydrawise_all').then(data => {
    if (data.error_msg) {
      t.fail(`Error: ${data.error_msg}`);
    }
    t.pass();
  });
});

test('Set Controller', t => {
  return h.setcontroller('11774').then(() => {
    t.pass();
  });
});

test('Stop Zones', t => {
  return h.setzone('stopall').then(data => {
    if (data.message_type === 'error') {
      t.fail(`Error: ${data.message}`);
    }
    t.pass();
  });
});

test('Run All Zones', t => {
  return h.setzone('runall', {period_id: '999', custom: '60'}).then(data => {
    if (data.message_type === 'error') {
      t.fail(`Error: ${data.message}`);
    }
    t.pass();
  });
});
