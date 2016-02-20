const express = require('express');

const router = express.Router();

router.post('/eval', (req, res) => {
  global.kernel.send({ type: 'eval', data: req.body.code});
  res.send('OK.');
});

module.exports = router;
