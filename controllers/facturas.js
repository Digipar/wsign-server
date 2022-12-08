const fs = require("fs");
const SignedXml = require("xml-crypto").SignedXml;
const KeyProvider = require("../helpers/keyProvider");
const xml2js = require("xml2js");
const parser = new xml2js.Parser();


const getDigestValue = (xml) => {
  let digestValue = "";
  parser.parseString(xml, function (err, result) {
    digestValue =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "Signature"
      ][0]["SignedInfo"][0]["Reference"][0]["DigestValue"][0];
  });
  return digestValue;
};

const getQRData = (xml, digestValue) => {
  let QRData = {};
  parser.parseString(xml, function (err, result) {
    const nVersion =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "dVerFor"
      ][0];
    const dFeEmiDE =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "DE"
      ][0]["gDatGralOpe"][0]["dFeEmiDE"][0]; // to hex
    const dFeEmiDEHex = Buffer.from(dFeEmiDE).toString("hex");
    const dRucRec =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "DE"
      ][0]["gDatGralOpe"][0]["gDatRec"][0]["dRucRec"][0];
    const dTotGralOpe =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "DE"
      ][0]["gTotSub"][0]["dTotGralOpe"][0];
    const dTotIVA =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "DE"
      ][0]["gTotSub"][0]["dTotIVA"][0];
    // to be checked
    const cItems =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "DE"
      ][0]["gDtipDE"][0]["gCamItem"].length;

    const DigestValueHex = Buffer.from(digestValue).toString("hex");
    const IdcSC = "0001";
    const CSC = "ABCD0000000000000000000000000000";
    QRData = {
      nVersion,
      dFeEmiDEHex,
      dRucRec,
      dTotGralOpe,
      dTotIVA,
      cItems,
      DigestValueHex,
      IdcSC,
      CSC,
    };
  });
  return QRData;
};

const writeQRUrl = (xml, url) => {
  let xmlWithUrl = "";
  // write url to the dCarQR field
  parser.parseString(xml, function (err, result) {
    result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
      "gCamFuFD"
    ][0]["dCarQR"] = url;
    const builder = new xml2js.Builder({
      renderOpts: { pretty: false },
      headless: true,
    });
    xmlWithUrl = builder.buildObject(result);
  });
  return xmlWithUrl;
};

const getCDC = (xml) => {
  let cdc = "";
  parser.parseString(xml, function (err, result) {
    cdc =
      result["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0]["xDE"][0]["rDE"][0][
        "DE"
      ][0]["$"]["Id"];
  });
  return cdc;
};

module.exports = {
  signXML: (xmlReceived) => {
    const hash = require("crypto").createHash("sha256");
    // start signing
    const sig = new SignedXml();
    sig.signatureAlgorithm =
      "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
    sig.canonicalizationAlgorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
    // add the enveloped-signatue and the xml-exc-c14n# reference to the signature
    sig.addReference(
      "//*[local-name(.)='DE']",
      [
        "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
        "http://www.w3.org/2001/10/xml-exc-c14n#",
      ],
      "http://www.w3.org/2001/04/xmlenc#sha256"
    );
    // add the keyInfo - to be done: get the .pem file from the database
    sig.signingKey = fs.readFileSync("./EMPRESA.pem");
    sig.keyInfoProvider = new KeyProvider();
    sig.computeSignature(xmlReceived, {
      location: { reference: "//*[local-name(.)='DE']", action: "after" }, //This will place the signature after the book element
    });
    const xmlSigned = sig.getSignedXml();
    // construct the URL
    // get the digestValue
    const digestValue = getDigestValue(xmlSigned);
    const {
      nVersion,
      dFeEmiDE,
      dFeEmiDEHex,
      dRucRec,
      dTotGralOpe,
      dTotIVA,
      cItems,
      DigestValue,
      DigestValueHex,
      IdcSC,
      CSC,
    } = getQRData(xmlReceived, digestValue);
    // get the Id
    const cdc = getCDC(xmlReceived);
    const id = cdc;
    const concatenated = `nVersion=${nVersion}&Id=${id}&dFeEmiDE=${dFeEmiDEHex}&dRucRec=${dRucRec}&dTotGralOpe=${dTotGralOpe}&dTotIVA=${dTotIVA}&cItems=${cItems}&DigestValue=${DigestValueHex}&IdCSC=${IdcSC}${CSC}`;
    hash.update(concatenated, "binary");
    const hashHex = hash.digest("hex");
    const urlRoot = "https://ekuatia.set.gov.py/consultas-test/qr?";
    const url = `${urlRoot}nVersion=${nVersion}&Id=${id}&dFeEmiDE=${dFeEmiDEHex}&dRucRec=${dRucRec}&dTotGralOpe=${dTotGralOpe}&dTotIVA=${dTotIVA}&cItems=${cItems}&DigestValue=${DigestValueHex}&IdCSC=${IdcSC}&cHashQR=${hashHex}`;
    const signedXmlWithQR = writeQRUrl(xmlSigned, url);
    return signedXmlWithQR;
  },
};
