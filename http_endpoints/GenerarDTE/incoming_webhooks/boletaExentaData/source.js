// This function is the webhook's request handler.
// exports({query: {folio: 10, dte: 41}})
exports = async function(payload, response) {
    const folio = parseInt(payload.query.folio);
    const dte = parseInt(payload.query.dte);
    const emisor = '78730160';
    
    if (isNaN(folio) || folio <= 0 ) {
      return "Folio inválido.";
    }
    
    if (isNaN(dte)) {
      return "Tipo de documento inválido."
    }
    
    let uri = `https://libredte.cl/api/dte/dte_emitidos/info/${dte}/${folio}/${emisor}?getXML=1&getDetalle=1&getDatosDte=1&getTed=1&getResolucion=1&getEmailEnviados=1`;

    let options = {
      headers: {
        "Accept": "application/json",
        "Authorization": "ZXEzQ3hpeXM5V1AzOFF5MTZLUFlsMXpIZ2xqRmwxdDg6WA=="
      }
    }

    const axios = require('axios');
    
    res = await axios.get(uri, options);

    return res.data;
};