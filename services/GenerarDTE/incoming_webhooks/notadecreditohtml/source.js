// This function is the webhook's request handler.
// exports({query: {folio: 6}})
exports = async function(payload, response) {
  const {Base64} = require('js-base64');
  const axios = require('axios');
  
  const notadecredito = parseInt(payload.query.folio);
  const produccion = payload.query.produccion || 0;
  
  let database = "dte";
  if (produccion == 1) {
    database = "dte-production";
  }
    
  if (isNaN(notadecredito) || notadecredito <= 0) {
    return { status: "400", message: "Folio no válido"};
  }
  
  let boleta = await context.services.get("base-dte").db(database).collection("boleta-exenta").findOne({notadecredito});
  if (!boleta || !boleta.libredte) {
    return { status: "404", message: "Nota de Crédito no corresponde a un DTE."};
  }
  
  let dte = "";

  // USES LIBREDTE DATABASE
  if (true) {
    const emisor = '78730160';
    let uri = `https://libredte.cl/api/dte/dte_emitidos/info/41/${boleta.folio}/${emisor}?getXML=1&getDetalle=1&getDatosDte=1&getTed=0&getResolucion=1&getEmailEnviados=0`;

    let options = {
      headers: {
        "Accept": "application/json",
        "Authorization": "ZXEzQ3hpeXM5V1AzOFF5MTZLUFlsMXpIZ2xqRmwxdDg6WA=="
      }
    }
    
    res = await axios.get(uri, options);

    dte = Base64.decode(res.data.xml);
  } else {
    dte = Base64.decode(boleta.libredte.xml.dte)
    //let sii = Base64.decode(boleta.libredte.xml.sii)
    //let receptor = Base64.decode(boleta.libredte.xml.receptor)
  }
  
  
  
  return {notadecredito: `${notadecredito}`, dte: dte, sii: "sii", receptor: "receptor", ejecutivo: boleta.ejecutivo || res.data.extra.venta.ejecutivo, cuenta: `${boleta.paciente.codigo}` || `${res.data.extra.venta.codigoPaciente}`};
};