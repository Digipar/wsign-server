const express = require('express');
const router = express.Router();
const validateInvoice = require('../middlewares/validate-invoice');
const facturasController = require('../controllers/facturas');

/* POST to sign an xml, with validation middleware. */
router.post('/firmar',validateInvoice, function(req, res, next) {
  // console.log('  req.body',   Buffer.from(req.body).toString('utf8'));
  if(req.body === undefined) {
    res.status(400).send('No XML received');
    return;
  }
  const xmlReceived = Buffer.from(req.body).toString('utf8');
  const xmlSigned = facturasController.signXML(xmlReceived);  
  res.send(xmlSigned);
});

module.exports = router;
