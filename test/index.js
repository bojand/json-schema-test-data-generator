import test from 'ava';
import generate from '../dist/index';
import _ from 'lodash';
const userSchema = require('./user.json');

test('should generate test data with differnte variations based on required property', t => {
  const required = userSchema.required;
  const data = generate(userSchema);

  // should have data that has all required fields
  let found = _.some(data, d => {
    const v = d.valid;
    const keys = Object.keys(d.data);
    const diff = _.difference(required, keys);
    return v === true && diff.length === 0;
  });

  t.is(found, true);

  required.forEach(req => {
    // check that there is sample data that does not have the required property
    found = _.some(data, d => {
      const keys = Object.keys(d.data);
      return d.valid === false && keys.indexOf(req) === -1;
    });

    t.is(found, true);
  });

  t.pass();
});
