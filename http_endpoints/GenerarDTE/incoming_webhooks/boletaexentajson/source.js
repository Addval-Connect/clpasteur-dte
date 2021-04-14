// This function is the webhook's request handler.
exports = async function(payload, response) {
  const {Base64} = require('js-base64');
  // Data can be extracted from the request as follows:

  // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
  const folio = parseInt(payload.query.folio);

  if (isNaN(folio) || folio <= 0) {
    //response.setStatusCode(400)
    return {status: "400", message: "No es un folio valido."};
  }
  
  let boleta = await context.services.get("base-dte").db("dte").collection("boleta-exenta").findOne({folio});
  
  if (!boleta || !boleta.libredte) {
    //response.setStatusCode(400);
    return {status: "400", message: "No hay DTE con este folio."};
  }
  
  let xml = Base64.decode(boleta.libredte.xml.dte)
  
  return {jsonDTE};
};