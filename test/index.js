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

  t.true(found);

  required.forEach(req => {
    // check that there is sample data that does not have the required property
    found = _.some(data, d => {
      const keys = Object.keys(d.data);
      return d.valid === false && keys.indexOf(req) === -1;
    });

    t.true(found, `test failed for property: ${req}`);
  });

  t.pass();
});

test('should generate test data with negative type tests for simple primitive data types', t => {
  const required = userSchema.required;
  const data = generate(userSchema);

  required.forEach(req => {
    const found = _.chain(data)
      .filter(d => (d.valid === false) && (d.property && d.property === req) && (typeof d.data[req] !== 'undefined'))
      .some(d => {
        const types = generate.getNegativeTypes(userSchema.properties[req]);
        const dataType = d.data[req] === null ? 'null' : typeof d.data[req];
        const check = types.indexOf(dataType) >= 0;
        return check;
      }).value();

    t.true(found, `test failed for property: ${req}`);
  });

  t.pass();
});
