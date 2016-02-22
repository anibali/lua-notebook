const threads = require('threads');
const kernel = threads.spawn('src/kernel.js');

const state = {
  cellList: {
    cells: [
      {
        id: 1,
        code: 'display_html("Hello")',
        output: []
      }
    ]
  },
  kernel
};

const messages = [];

kernel.on('message', (msg) => {
  msg.id = state.cellList.cells[0].output.length + 1;
  state.cellList.cells[0].output.push(msg);
  // kernel.kill();
});

module.exports = state;
