const jsf = require('json-schema-faker');
const _ = require('lodash');
const Chance = require('chance');
// const ps = require('prop-search');

const chance = new Chance();
const types = ['array', 'boolean', 'integer', 'number', 'null', 'object', 'string'];
// const formats = ['date-time', 'email', 'hostname', 'ipv4', 'ipv6', 'uri', 'url', 'uuid'];

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

function generateForProp(schema, key, type) {
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

  d[key] = value;
  return {
    valid: false,
    data: d,
    message: `should not work with '${key}' of type '${type}'`,
    property: key
  };
}

function generateNegativeType(schema, key, prop) {
  const negativeTypes = getNegativeTypes(prop);
  if (!negativeTypes || !negativeTypes.length) {
    return [];
  }

  const newType = _.sample(negativeTypes);
  return [generateForProp(schema, key, newType)];
}

function generateNegativesForNumber(schema, key, prop) {
  const ret = [];
  if (typeof prop.multipleOf === 'number' && prop.multipleOf >= 0) {
    const d = jsf(schema);
    d[key] = prop.multipleOf - 1;
    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for multipleOf property: ${key}`
    });
  }
  if (typeof prop.maximum === 'number') {
    const d = jsf(schema);
    d[key] = prop.maximum + 1;
    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for maximum of property: ${key}`
    });
  }
  if (typeof prop.minimum === 'number') {
    const d = jsf(schema);
    d[key] = prop.minimum - 1;
    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for minimum of property: ${key}`
    });
  }

  return ret;
}

function generateNegativesForString(schema, key, prop) {
  const ret = [];
  if (typeof prop.maxLength === 'number') {
    const d = jsf(schema);
    d[key] = chance.string({ length: prop.maxLength + 1 });
    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for maxLength of property: ${key}`
    });
  }
  if (typeof prop.minLength === 'number' && prop.minLength > 0) {
    const d = jsf(schema);
    d[key] = chance.string({ length: prop.minLength - 1 });
    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for minLength of property: ${key}`
    });
  }
  if (typeof prop.format === 'string') {
    const d = jsf(schema);
    d[key] = chance.string();
    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for format of property: ${key}`
    });
  }

  return ret;
}

function generateNegativesForArray(schema, key, prop) {
  const ret = [];
  if (typeof prop.items === 'object' && typeof prop.maxItems === 'number') {
    const d = jsf(schema);

    if (!Array.isArray(d[key])) {
      d[key] = [];
    }

    while (d[key].length <= prop.maxItems) {
      d[key].push(jsf(prop.items));
    }

    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for maxItems of property: ${key}`
    });
  }
  if (typeof prop.items === 'object' && typeof prop.minItems === 'number') {
    const d = jsf(schema);

    if (!Array.isArray(d[key])) {
      d[key] = [];
    }

    while (d[key].length >= prop.minItems && d[key].length > 0) {
      d[key].pop();
    }

    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for minItems of property: ${key}`
    });
  }
  if (typeof prop.items === 'object' && prop.uniqueItems === true) {
    const d = jsf(schema);

    if (!Array.isArray(d[key])) {
      d[key] = [];
    }

    if (!d[key].length) {
      d[key].push(jsf(prop.items));
    }

    d[key].push(d[key][0]);

    ret.push({
      valid: false,
      data: d,
      property: key,
      message: `should not pass validation for uniqueItems of property: ${key}`
    });
  }

  return ret;
}

function generateNegativeDetailsForType(schema, key, prop) {
  const type = prop.type;
  const ret = [];
  if (['integer', 'number', 'string', 'array'].indexOf(type) === -1) {
    return ret;
  }

  if (type === 'integer' || type === 'number') {
    ret.push(...generateNegativesForNumber(schema, key, prop));
  } else if (type === 'string') {
    ret.push(...generateNegativesForString(schema, key, prop));
  } else if (type === 'array') {
    ret.push(...generateNegativesForArray(schema, key, prop));
  }

  return ret;
}

function generateForTypes(schema) {
  const ret = [];
  const keys = Object.keys(schema.properties);
  if (!keys || !keys.length) {
    return ret;
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const prop = schema.properties[key];

    ret.push(...generateNegativeType(schema, key, prop));
    ret.push(...generateNegativeDetailsForType(schema, key, prop));
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

function generate(schema) {
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
  ret.push(...generateForTypes(schema));

  return ret;
}

generate.getNegativeTypes = getNegativeTypes;
module.exports = generate;
