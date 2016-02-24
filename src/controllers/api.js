const express = require('express');

const serverState = require('../server-state');

const router = express.Router();

router.post('/eval', (req, res) => {
  // TODO: Determine correct notebook/cell from params
  const notebook = serverState.notebooks[0];
  const cell = notebook.cells[0];

  cell.code = req.body.code;
  notebook.kernel.send({ type: 'eval', data: cell.code });

  res.send('OK.');
});

module.exports = router;
