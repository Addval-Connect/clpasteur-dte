// This function is the webhook's request handler.
// exports({query: {folio: 1478, tipo: "exenta"}})
exports = async function(payload, response) {
    const folioBoleta = parseInt(payload.query.folio);
    let tipoBoleta = decodeURIComponent(payload.query.tipo);
    
    if (isNaN(folioBoleta) || folioBoleta <= 0) {
      return { status: "400", message: "Folio no válido"};
    }
    
    if (tipoBoleta != "exenta") {
      if (tipoBoleta != "afecta") {
        return { status: "400", message: "Tipo de boleta no válido."};
      }
    }
    
    if (tipoBoleta == "exenta" && folioBoleta < 600) {
      return { status: "400", message: "Folio incompatible. utilice sobre el número 600."};
    }
    
    let database = "dte";
    
    let ultimoFolio = await context.services.get("base-dte").db(database).collection(`boleta-${tipoBoleta}`).find({ "notadecredito": { $gt: 0 } }).sort({ "notadecredito" : -1 }).toArray();
    let nuevoFolio = 0;
    if (ultimoFolio.length) {
      nuevoFolio = ultimoFolio[0].notadecredito + 1;
    }
    
    let checkBoleta = await context.services.get("base-dte").db(database).collection(`boleta-${tipoBoleta}`).findOne({folio: folioBoleta});
    if (!checkBoleta) {
      return { status: "404", message: "No se encontró la boleta."};
    }
    
    if (checkBoleta.notadecredito) {
      return { status: "200", message: "La boleta ya tiene nota de crédito.", folio: `${checkBoleta.notadecredito}` };
    }
    
    let boleta = await context.services.get("base-dte").db(database).collection(`boleta-${tipoBoleta}`).updateOne({folio: folioBoleta}, { $set: { notadecredito: nuevoFolio }});
    
    if (!boleta) {
      return { status: "404", message: "Folio no corresponde a un DTE."};
    }
    
    return  { status: "200", folio: `${nuevoFolio}`, trackid: "0" };
};