/**
 * This is the entrypoint for our application on the server.
 * When the server is started, this code will run.
 */

// Use Babel to provide support for ES6
require('babel-core/register');

// Require our Express app (see app.js)
const app = require('./app');

// Start the server and wait for connections
const server = app.listen(3000, () => {
  console.log('Server started.');
});

module.exports = server;
