const threads = require('threads');
const _ = require('lodash');

const startNewKernel = () => {
  // NOTE: The kernel can be killed later with `kernel.kill()`
  const kernel = threads.spawn('src/kernel.js');
  return kernel;
};

const state = {
  notebooks: [
    {
      id: 1,
      kernel: startNewKernel(),
      cells: [
        {
          id: 1,
          code: 'display_html("Hello")',
          output: []
        }
      ]
    }
  ],
};

_.forEach(state.notebooks, (notebook) => {
  notebook.kernel.on('message', (msg) => {
    // TODO: Find correct cell to update output for
    msg.id = notebook.cells[0].output.length + 1;
    notebook.cells[0].output.push(msg);
  });
});

module.exports = state;
