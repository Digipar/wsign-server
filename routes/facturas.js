var express = require('express');
var router = express.Router();
// get middleware
var validateInvoice = require('../middleware/validate-invoice');

/* POST to sign an xml, with validation middleware. */
router.post('/firmar',validateInvoice, function(req, res, next) {
  res.send('Just received a POST request to sign an xml');
});

module.exports = router;
