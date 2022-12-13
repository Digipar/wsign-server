const xml2js = require('xml2js');
const builder = new xml2js.Builder({ renderOpts: { 'pretty': false }, headless: true });

module.exports = {
    generateXml: (invoiceData) => {
        console.log(invoiceData.xDE.rDE)
        invoiceData.xDE.rDE["$"] = {"xmlns": "http://ekuatia.set.gov.py/sifen/xsd","xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation": "http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd"}
        // date in format AAAA-MM-DDThh:mm:ss
        invoiceData.xDE.rDE.DE.dFecFirma = new Date().toISOString().slice(0, 19);
        const obj = {
            "soap:Envelope": {
                $: { 'xmlns:soap': "http://www.w3.org/2003/05/soap-envelope" },
                "soap:Header": {},
                "soap:Body": {
                    "rEnviDe": {
                        $: { 'xmlns': "http://ekuatia.set.gov.py/sifen/xsd" },
                        ...invoiceData
                    }
                }
            }
        }
        return builder.buildObject(obj);
    }
}