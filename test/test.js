const generate = require('../dist');

const schema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 0
    },
    name: {
      type: 'string'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    dob: {
      type: 'string',
      format: 'date-time'
    },
    company: {
      type: 'string'
    },
    age: {
      type: 'integer'
    }
  },
  required: ['id', 'name', 'email']
};

console.dir(generate(schema));
