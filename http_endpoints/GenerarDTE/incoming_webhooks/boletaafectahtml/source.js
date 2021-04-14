// This function is the webhook's request handler.
exports = async function(payload, response) {
  const {Base64} = require('js-base64');
  
  const folio = parseInt(payload.query.folio);
  const produccion = payload.query.produccion || 0;
  
  let database = "dte";
  if (produccion == 1) {
    database = "dte-production";
  }
    
  if (isNaN(folio) || folio <= 0) {
    return { status: "400", message: "Folio no válido"};
  }
  
  let boleta = await context.services.get("base-dte").db(database).collection("boleta-afecta").findOne({folio});
  if (!boleta || !boleta.libredte) {
    return { status: "404", message: "Folio no corresponde a un DTE."};
  }

  let dte = Base64.decode(boleta.libredte.xml.dte)
  //let sii = Base64.decode(boleta.libredte.xml.sii)
  //let receptor = Base64.decode(boleta.libredte.xml.receptor)
  
  return {dte: dte, sii: "sii", receptor: "receptor"};
};