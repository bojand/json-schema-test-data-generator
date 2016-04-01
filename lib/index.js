const jsf = require('json-schema-faker');
const _ = require('lodash');
const ps = require('prop-search');

function validate(schema) {
  // return Error here?

  if (typeof schema !== 'object') {
    return false;
  }

  if (typeof schema.properties !== 'object') {
    return false;
  }

  return true;
}

function generateFromRequired(schema, positive = true) {
  const ret = [];
  if (!Array.isArray(schema.required) || !schema.required.length) {
    return ret;
  }

  const keys = Object.keys(schema.properties);
  const props = positive ? _.difference(keys, schema.required) : schema.required;

  if (!Array.isArray(props) || !props.length) {
    return ret;
  }

  props.forEach(prop => {
    if (typeof prop === 'string') {
      const sample = jsf(schema);
      const msg = positive ? `should work without optional property: ${prop}` :
        `should not work without required property: ${prop}`;

      ret.push({
        valid: positive,
        data: _.omit(sample, prop),
        message: msg
      });
    }
  });

  return ret;
}

export default function generate(schema) {
  const ret = [];
  if (!validate(schema)) {
    return ret;
  }

  const fullSample = jsf(schema);
  if (typeof fullSample !== 'object') {
    return ret;
  }

  ret.push({
    valid: true,
    data: fullSample,
    message: 'should work with all required properties'
  });

  ret.push(...generateFromRequired(schema));
  ret.push(...generateFromRequired(schema, false));

  return ret;
}

module.exports = generate;
