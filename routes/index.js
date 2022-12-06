var express = require('express');
var router = express.Router();

/* GET welcome message. */
router.get('/', function(req, res, next) {
  res.send('Welcome to the express server');
});

module.exports = router;
