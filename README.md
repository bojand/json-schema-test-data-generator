# json-schema-test-data-generator

Not overly sophisticated utility that generates sample test data based on JSON schema.

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
    data: { name: 'Lorem', email: 'Rl5W1lWNWCxI2@IKXPOiX.tx' },
    message: 'should work with all required properties' },
  { valid: true,
    data:
     { name: 'in Excepteur',
       email: 'dI4QX7i3o4aW1@pCYSSCbdzKxinpBylf.bid',
       accountNumber: -45141884.82426107 },
    message: 'should work without optional property: active',
    property: 'active' },
  { valid: true,
    data:
     { name: 'consectetur amet dolor',
       email: 'ylDMsjokBq6o@kyISBuRrISJSVGfps.chh' },
    message: 'should work without optional property: accountNumber',
    property: 'accountNumber' },
  { valid: false,
    data: { email: 'inL@FijDPFt.jsv' },
    message: 'should not work without required property: name',
    property: 'name' },
  { valid: false,
    data: { name: 'labore', active: true },
    message: 'should not work without required property: email',
    property: 'email' },
  { valid: false,
    data: { name: true, email: '3JbKSBUkulRThv@BB.bbsf' },
    message: 'should not work with \'name\' of type \'boolean\'',
    property: 'name' },
  { valid: false,
    data:
     { name: '4x%u',
       email: '5j6OszCCU-gZFx4@htyNxrrFVtVJghtWRaXQhjALzJqisumh.pmz' },
    message: 'should not pass validation for minLength of property: name',
    property: 'name' },
  { valid: false,
    data:
     { name: 'deserunt nostrud dolore ea',
       email: 'b9XLfGB3Bs@golsytCcKabldW.ufin',
       active: 5313786068074496 },
    message: 'should not work with \'active\' of type \'integer\'',
    property: 'active' },
  { valid: false,
    data:
     { name: 'cillum ',
       email: null,
       accountNumber: 67113212.30977774 },
    message: 'should not work with \'email\' of type \'null\'',
    property: 'email' },
  { valid: false,
    data: { name: 'anim laborum quis occaecat', email: '8WruHF' },
    message: 'should not pass validation for format of property: email',
    property: 'email' },
  { valid: false,
    data:
     { name: 'veniam nulla ut',
       email: 'wYcn@RVogRzpzOxnmGQvStZmpMkil.czip',
       accountNumber: 'sn0S2H9j)]' },
    message: 'should not work with \'accountNumber\' of type \'string\'',
    property: 'accountNumber' } ]
```

## API Reference

<a name="generate"></a>

## generate(schema) ⇒ <code>Array</code>
Generates test data based on JSON schema

**Kind**: global function  
**Returns**: <code>Array</code> - Array of test data objects  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>Object</code> | Fully expanded (no <code>$ref</code>) JSON Schema |

## CLI

`jstdgen schema.json > testdata.json`
