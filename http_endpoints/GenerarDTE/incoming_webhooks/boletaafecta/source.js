// This function is the webhook's request handler.
// exports({query: {servicios: '[{"monto": 1000, "codigo": 1, "nombre": "1", "cantidad": 1}]', paciente: '{"nombre": "nombre paciente", "codigo": 1, "rut": "16211150-7"}', ejecutivo: "nombre ejecutivo"}})
exports = async function (payload, response) {
  const servicesURI = decodeURIComponent(payload.query.servicios), pacienteURI = decodeURIComponent(payload.query.paciente), ejecutivoURI = decodeURIComponent(payload.query.ejecutivo), produccion = payload.query.produccion || 0;
  let database = produccion == 1 ? "dte-production" : "dte", boletaUri = "generar-xml-uri", services = {}, paciente = {}, total = 0;
  const replaceDiacritics = (value) => {
    return context.functions.execute("replaceDiacritics", value);
  }
  const getValue = (key) => {
    return context.values.get(key);
  }

  try {
    services = JSON.parse(servicesURI);
    paciente = JSON.parse(pacienteURI);
  } catch (err) {
    return { "status": "400", message: "Los parámetros de entrada no son un JSON válido." };
  }

  for (let service of services) {
    if (isNaN(service.monto) || isNaN(service.codigo) || !service.nombre || service.monto <= 0 || isNaN(service.cantidad) || service.cantidad <= 0) {
      return { status: "400", message: "Uno o más valores de los servicios no son válidos." };
    }
  }

  if (!paciente.nombre || !paciente.codigo || !paciente.rut) {
    return { status: "400", message: "Uno o más valores del paciente no son válidos." };
  }

  if (typeof (ejecutivoURI) == "undefined") {
    return { status: "400", message: "El parámetro ejecutivo no es válido." };
  }

  let ejecutivo = await replaceDiacritics(ejecutivoURI);

  const boletaAfecta = context.services.get("mongodb-atlas").db(database).collection("boleta-afecta")
  let ultimoFolio = await boletaAfecta.findOne({ "ultimoFolio": true });
  let nuevoFolio = ultimoFolio.folio + 1;

  const axios = require('axios');
  const caf = getValue("caf-base64-afecta"), certData = getValue("cert-data"), pkeyData = getValue("pkey-data"), uri = getValue(boletaUri), resolucion = getValue("sii-resolucion-boletas-afectas"), libreDTEAuthHeader = getValue("libredte-authorizarion-header");
  let siiAuthObject = context.values.get("sii-auth-object");
  siiAuthObject.cert["cert-data"] = certData;
  siiAuthObject.cert["pkey-data"] = pkeyData;

  let boletaDTE = context.values.get("sii-dte-boleta-afecta");
  boletaDTE["Encabezado"]["IdDoc"]["Folio"] = parseInt(nuevoFolio);
  boletaDTE["Encabezado"]["Receptor"]["RUTRecep"] = paciente.rut;
  boletaDTE["Encabezado"]["Receptor"]["RznSocRecep"] = await replaceDiacritics(paciente.nombre);
  boletaDTE["Encabezado"]["Receptor"]["CdgIntRecep"] = paciente.codigo;
  boletaDTE["Referencia"] = [];
  boletaDTE["Referencia"].push({ "RazonRef": ejecutivo });

  boletaDTE["Detalle"] = [];

  for (let service of services) {
    total = total + (service.monto * service.cantidad);

    boletaDTE["Detalle"].push({
      "NmbItem": `${service.codigo} - ${service.nombre}`,
      "QtyItem": service.cantidad,
      "PrcItem": service.monto
    });
  }

  let iva = total * 0.19;
  let totalAfecto = total + iva;

  let body = {
    auth: siiAuthObject,
    dte: boletaDTE,
    resolucion: resolucion,
    caf: caf
  };

  let options = {
    headers: {
      "Accept": "application/json",
      "Authorization": libreDTEAuthHeader
    }
  };

  res = await axios.post(uri, body, options);

  if (res.status == 200) {

    await boletaAfecta.insertOne({
      "ultimoFolio": true,
      "folio": nuevoFolio,
      "servicios": services,
      "paciente": paciente,
      "ejecutivo": ejecutivo || "",
      "libredte": res.data
    });

    await boletaAfecta.updateOne({ "folio": ultimoFolio.folio }, { $set: { "ultimoFolio": false } });

    return { status: "200", folio: `${nuevoFolio}`, monto: `${total}`, xml: res.data.xml.dte, produccion: produccion };
  } else {
    return { status: "400" };
  }

};