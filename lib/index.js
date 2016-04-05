const jsf = require('json-schema-faker');
const _ = require('lodash');
const Chance = require('chance');
const ps = require('prop-search');

const chance = new Chance();
const types = ['array', 'boolean', 'integer', 'number', 'null', 'object', 'string'];
// const formats = ['date-time', 'email', 'hostname', 'ipv4', 'ipv6', 'uri', 'url', 'uuid'];

function validate(schema) {
  if (typeof schema !== 'object') {
    return false;
  }

  if (typeof schema.properties !== 'object' && typeof schema.type !== 'string') {
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

function generateForProp(schema, type, key) {
  let d = jsf(schema);
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

  if (key) {
    d[key] = value;
  } else {
    d = value;
  }

  const ret = {
    valid: false,
    data: d,
    message: key ? `should not work with '${key}' of type '${type}'` : `should not work with type '${type}'`
  };

  if (key) {
    ret.property = key;
  }

  return ret;
}

function generateNegativeType(schema, prop, key) {
  const negativeTypes = getNegativeTypes(prop);
  if (!negativeTypes || !negativeTypes.length) {
    return [];
  }

  const newType = _.sample(negativeTypes);
  return [generateForProp(schema, newType, key)];
}

function generateNegativesForNumber(schema, prop, key) {
  const ret = [];
  if (typeof prop.multipleOf === 'number' && prop.multipleOf >= 0) {
    let d = jsf(schema);
    const nv = prop.multipleOf - 1;
    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    const r = {
      valid: false,
      data: d,
      message: key ? `should not pass validation for multipleOf property: ${key}` : 'should not pass validation for multipleOf'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }
  if (typeof prop.maximum === 'number') {
    let d = jsf(schema);
    const nv = prop.maximum + 1;
    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    const r = {
      valid: false,
      data: d,
      message: key ? `should not pass validation for maximum of property: ${key}` : 'should not pass validation for maximum'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }
  if (typeof prop.minimum === 'number') {
    let d = jsf(schema);
    const nv = prop.minimum - 1;
    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    const r = {
      valid: false,
      data: d,
      message: key ? `should not pass validation for minimum of property: ${key}` : 'should not pass validation for minimum'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }

  return ret;
}

function generateNegativesForString(schema, prop, key) {
  const ret = [];
  if (typeof prop.maxLength === 'number') {
    let d = jsf(schema);
    const nv = chance.string({ length: prop.maxLength + 1 });

    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    const r = {
      valid: false,
      data: d,
      message: key ? `should not pass validation for maxLength of property: ${key}` : 'should not pass validation for maxLength'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }
  if (typeof prop.minLength === 'number' && prop.minLength > 0) {
    let d = jsf(schema);
    const nv = chance.string({ length: prop.minLength - 1 });

    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    const r = {
      valid: false,
      data: d,
      message: key ? `should not pass validation for minLength of property: ${key}` : 'should not pass validation for minLength'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }
  if (typeof prop.format === 'string') {
    let d = jsf(schema);
    const nv = chance.string();
    if (key) {
      d[key] = nv;
    } else {
      d = nv;
    }

    const r = {
      valid: false,
      data: d,
      message: key ? `should not pass validation for format of property: ${key}` : 'should not pass validation for format'
    };

    if (key) {
      r.property = key;
    }

    ret.push(r);
  }

  return ret;
}

function generateNegativesForArray(schema, prop, key) {
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

  // generate tests for items schema
  if (typeof prop.items === 'object') {
    const itemData = generate(prop.items);

    itemData.forEach(i => {
      const d = jsf(schema);
      const sr = ps.search(d, e => Array.isArray(e[key]), { separator: '.' });
      if (sr && sr.length && sr[0]) {
        const p = sr[0].path ? sr[0].path.concat(`.${key}`) : key;
        const nd = [i.data];
        if (typeof prop.minItems === 'number') {
          const extra = _.times(prop.minItems, () => jsf(prop.items));
          nd.push(...extra);
        }
        _.set(d, p, nd);

        ret.push({
          valid: i.valid,
          data: d,
          property: key,
          message: `within array test: ${i.message}`
        });
      }
    });
  }

  return ret;
}

function generateNegativeDetailsForType(schema, prop, key) {
  const type = prop.type;
  const ret = [];
  if (['integer', 'number', 'string', 'array'].indexOf(type) === -1) {
    return ret;
  }

  if (type === 'integer' || type === 'number') {
    ret.push(...generateNegativesForNumber(schema, prop, key));
  } else if (type === 'string') {
    ret.push(...generateNegativesForString(schema, prop, key));
  } else if (type === 'array') {
    ret.push(...generateNegativesForArray(schema, prop, key));
  }

  return ret;
}

function generateForTypes(schema) {
  const ret = [];
  const keys = schema.properties ? Object.keys(schema.properties) : [null];
  if (!keys || !keys.length) {
    return ret;
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const prop = key === null ? schema : schema.properties[key];

    ret.push(...generateNegativeType(schema, prop, key));
    ret.push(...generateNegativeDetailsForType(schema, prop, key));
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
  if (!fullSample) {
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
