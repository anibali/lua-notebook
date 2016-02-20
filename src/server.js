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

const threads = require('threads');

const thread = threads.spawn('src/kernel.js')

thread.on('message', (msg) => {
  console.log(msg);
  // thread.kill();
});

thread.send({ type: 'eval', data: 'global_var = 42' });
thread.send({ type: 'eval', data: 'display_html(global_var)' });

module.exports = server
