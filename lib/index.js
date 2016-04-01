const jsf = require('json-schema-faker');
const _ = require('lodash');
const Chance = require('chance');
// const ps = require('prop-search');

const chance = new Chance();
const types = ['array', 'boolean', 'integer', 'number', 'null', 'object', 'string'];
const formats = ['date-time', 'email', 'hostname', 'ipv4', 'ipv6', 'uri', 'url', 'uuid'];

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

function getNegativeTypes(prop) {
  if (!prop || !prop.type || (typeof prop.type !== 'string' && !Array.isArray(prop.type))) {
    return;
  }

  const allowedTypes = typeof prop.type === 'string' ? [prop.type] : prop.type;
  if (!allowedTypes.length) {
    return;
  }

  return _.difference(types, allowedTypes, ['object', 'array']);
}

function generateForProp(schema, prop, type) {
  const d = jsf(schema);
  let value;
  if (type === 'string') {
    value = chance.string();
  } else if (type === 'number') {
    value = chance.floating({ min: 0, max: 100, fixed: 2 });
  } else if (type === 'integer') {
    value = chance.integer();
  } else if (type === 'boolean') {
    value = chance.bool();
  } else if (type === 'null') {
    value = null;
  }

  d[prop] = value;
  return {
    valid: false,
    data: d,
    message: `should not work with '${prop}' of type '${type}'`,
    property: prop
  };
}

function generateNegativeTypes(schema) {
  const ret = [];
  if (!Array.isArray(schema.required) || !schema.required.length) {
    return ret;
  }

  for (let i = 0; i < schema.required.length; i++) {
    const req = schema.required[i];
    const prop = schema.properties[req];

    const negativeTypes = getNegativeTypes(prop);
    if (!negativeTypes || !negativeTypes.length) {
      return;
    }

    const newType = _.sample(negativeTypes);
    ret.push(generateForProp(schema, req, newType));
  }

  return ret;
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
        message: msg,
        property: prop
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
  ret.push(...generateNegativeTypes(schema));

  return ret;
}

generate.getNegativeTypes = getNegativeTypes;
module.exports = generate;
