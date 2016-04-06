# json-schema-test-data-generator

Not overly complicated utility that generates sample test data based on JSON schema.

## Installation

`npm install json-schema-test-data-generator`

## Usage

Module exports a single function that takes a JSON schema and outputs an array of test data objects based on the
JSON schema covering various (but not all) combinations to check against. The output objects are in format:

```
{
  valid:    // boolean: whether the test data is valid against the schema or not
  data:     // object: the actual data
  message:  // string: a descriptive message for the test data
  property: // string|undefined: if available, the key / property at test
}
```

Sample usage:

```
var generate = require('json-schema-test-data-generator');

var schema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength:": 5
    },
    "active": {
      "type": "boolean"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "accountNumber": {
      "type": "number"
    }
  },
  "required": ["name", "email"]
}

console.dir(generate(schema));
```

Output:

```
[ { valid: true,
    data: { name: 'fugiat', email: 'MjfjpzalS@JOxoLRHpKqgHmKYm.myio' },
    message: 'should work with all required properties' },
  { valid: true,
    data:
     { name: 'in',
       email: 'tubE6OdaTldIIr@dJyCJwNjrZYzgPlXOEEYkrMV.amk' },
    message: 'should work without optional property: active',
    property: 'active' },
  { valid: true,
    data:
     { name: 'Excepteur consectetur incididunt do',
       email: '4JD1Y-knFetc7@wEHDqxfhkANBq.vfj',
       active: false },
    message: 'should work without optional property: accountNumber',
    property: 'accountNumber' },
  { valid: false,
    data:
     { email: 'WxfUig3@xtnbqPYGdgYtLHfkQWKnFmLvikw.pou',
       active: false },
    message: 'should not work without required property: name',
    property: 'name' },
  { valid: false,
    data: { name: 'eiusmod', active: false },
    message: 'should not work without required property: email',
    property: 'email' },
  { valid: false,
    data:
     { name: null,
       email: 'jVjv@wqBJdScLzux.ni',
       accountNumber: -71970471.04127705 },
    message: 'should not work with \'name\' of type \'null\'',
    property: 'name' },
  { valid: false,
    data:
     { name: 'ea',
       email: 'Ip3Q@ZNRLFPcnZBMBDYNHzYiGxGhRSIu.xb',
       active: 'F^35OM2c' },
    message: 'should not work with \'active\' of type \'string\'',
    property: 'active' },
  { valid: false,
    data: { name: 'consectetur incididunt in culpa', email: false },
    message: 'should not work with \'email\' of type \'boolean\'',
    property: 'email' },
  { valid: false,
    data: { name: 'aliqua', email: 'EiQluDQ6vD&Ckp9YS' },
    message: 'should not pass validation for format of property: email',
    property: 'email' },
  { valid: false,
    data:
     { name: 'sed anim eiusmod',
       email: 'tXXyko@VDIJoVTpwbZsF.jro',
       accountNumber: 'jPK*Ju8RtGj' },
    message: 'should not work with \'accountNumber\' of type \'string\'',
    property: 'accountNumber' } ]
```

## API Reference

<a name="generate"></a>

## generate(schema) ⇒ <code>Array</code>
Generates test data based on JSON schema

**Kind**: global function  
**Returns**: <code>Array</code> - array of test data objects  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>Object</code> | JSON Schema |

## CLI

`jstd-gen schema.json > output.data`
