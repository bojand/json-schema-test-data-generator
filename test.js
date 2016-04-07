const generate = require('./dist');
// const schema = require('./test/user.json');
const jsf = require('json-schema-faker');

var schema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 5
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
