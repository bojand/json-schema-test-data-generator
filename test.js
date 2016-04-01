const generate = require('./dist');
const schema = require('./test/user.json');

console.dir(generate(schema));
