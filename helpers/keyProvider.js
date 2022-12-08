const fs = require("fs");
module.exports = class KeyProvider {
  getKey = () => fs.readFileSync("./EMPRESA.pub");
  getKeyInfo = () => {
    return `<X509Data><X509Certificate>${this.getKey()}</X509Certificate></X509Data>`;
  };
};
