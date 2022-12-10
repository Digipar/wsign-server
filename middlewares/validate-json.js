// fake a validation success
var validateJson = function(req, res, next) {
  console.log('Validating Json...');
  next();
};
//
module.exports = validateJson;