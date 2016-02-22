const express = require('express');

const serverState = require('../server-state');

const router = express.Router();

router.post('/eval', (req, res) => {
  serverState.kernel.send({ type: 'eval', data: req.body.code });
  serverState.cellList.cells[0].code = req.body.code;
  res.send('OK.');
});

module.exports = router;
