const generate = require('./dist');
const schema = require('./test/user.json');
const jsf = require('json-schema-faker');

const d = jsf({ type: 'string' });
console.dir(d);
console.dir(generate({ type: 'string' }));
