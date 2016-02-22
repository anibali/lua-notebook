const threads = require('threads');
const kernel = threads.spawn('src/kernel.js');

const messages = [];

kernel.on('message', (msg) => {
  msg.id = messages.length + 1;
  messages.push(msg);
  // kernel.kill();
});

module.exports = {
  kernel,
  messages
};
