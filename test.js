const generate = require('../dist');
const schema = require('./user.json');

console.dir(generate(schema));
