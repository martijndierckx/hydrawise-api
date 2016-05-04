import test from 'ava';
import Hydrawise from '../lib/hydrawise';

const hydrawise = new Hydrawise('53DC-7E24-07E8-CD7D');

test('Customer Details', t => {
  return hydrawise.customerdetails().then(data => {
    if (data.error_msg) {
      t.fail(`Error: ${data.error_msg}`);
    }
    t.pass();
  });
});

test('Status Schedule', t => {
  return hydrawise.statusschedule().then(data => {
    if (data.error_msg) {
      t.fail(`Error: ${data.error_msg}`);
    }
    t.pass();
  });
});

test('Status Schedule All', t => {
  return hydrawise.statusschedule('hydrawise_all').then(data => {
    if (data.error_msg) {
      t.fail(`Error: ${data.error_msg}`);
    }
    t.pass();
  });
});

test('Set Controller', t => {
  return hydrawise.setcontroller('11742').then(data => {
    if (data.error_msg) {
      t.fail(`Error: ${data.error_msg}`);
    }
    t.pass();
  });
});
