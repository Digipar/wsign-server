const express = require('express');
const router = express.Router();
const validateXml = require('../middlewares/validate-xml');
const validateJson = require('../middlewares/validate-json');
const facturasController = require('../controllers/facturas');

/* POST to create and sign an json, with validation middleware. */
router.post('/generar-firmar',validateJson, function(req, res, next) {
  console.log('  req.body',   req.body);
  if(req.body.length === 0) {
    res.status(400).send('No JSON received');
    return;
  }
  const xmlSigned = facturasController.createAndSignXML(req.body);
  res.send(xmlSigned);
});
/* POST to sign an xml, with validation middleware. */
router.post('/firmar',validateXml, function(req, res, next) {
  console.log('  req.body',   req.body);
  if(req.body.length === 0) {
    res.status(400).send('No XML received');
    return;
  }
  const xmlReceived = Buffer.from(req.body).toString('utf8');
  const xmlSigned = facturasController.signXML(xmlReceived);  
  res.send(xmlSigned);
});


module.exports = router;
