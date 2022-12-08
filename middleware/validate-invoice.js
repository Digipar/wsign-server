// fake a validation success
var validateInvoice = function(req, res, next) {
  console.log('Validating invoice...');
  next();
};
//
module.exports = validateInvoice;