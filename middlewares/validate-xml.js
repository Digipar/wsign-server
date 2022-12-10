// fake a validation success
var validateXml = function(req, res, next) {
  console.log('Validating Xml...');
  next();
};
//
module.exports = validateXml;