// This function is the webhook's request handler.
// exports({query: {servicios: '[{"monto": 1000, "codigo": 1, "nombre": "1", "cantidad": 1}]', paciente: '{"nombre": "nombre paciente", "codigo": 1, "rut": "16211150-7"}', ejecutivo: "nombre ejecutivo"}})
exports = async function(payload, response) {
    const servicesURI = decodeURIComponent(payload.query.servicios);
    const pacienteURI = decodeURIComponent(payload.query.paciente);
    let ejecutivoURI = decodeURIComponent(payload.query.ejecutivo);
    let fechaBoletaURI = decodeURIComponent(payload.query.fecha);
    const produccion = payload.query.produccion || 0;
    let database = "dte"
    let boletaUri = "generar-xml-uri";
    let retry = 0;
    
    if (produccion == 1) {
      database = "dte-production";
      retry = 10;
    }

    let services = {};
    let paciente = {};
    
    try {
      services = JSON.parse(servicesURI);
      paciente = JSON.parse(pacienteURI);
    } catch (err) {
      return { "status": "400", message: "Los parámetros de entrada no son un JSON válido." }
    }
  
    for (let service of services) {
      if (isNaN(service.monto) || isNaN(service.codigo) || !service.nombre || service.monto <= 0 || isNaN(service.cantidad) || service.cantidad <= 0 ) {
        return { status: "400", message: "Uno o más valores de los servicios no son válidos." }
      }
    }
    
    if (!paciente.nombre || !paciente.codigo || !paciente.rut) {
      return { status: "400", message: "Uno o más valores del paciente no son válidos." }
    }
    
    if (typeof(ejecutivoURI) == "undefined" || !ejecutivoURI || ejecutivoURI == "") {
      ejecutivoURI = "-";
    }
    
    let ejecutivo = ejecutivoURI || "-";
  
    let ultimoFolio = await context.services.get("base-dte").db(database).collection("boleta-exenta").findOne({"ultimoFolio": true});
    let nuevoFolio = ultimoFolio.folio + 1;
  
    let body = {
      "Encabezado": {
        "IdDoc": {
          "TipoDTE": 41
        },
        "Emisor":{
          "RUTEmisor":"78730160-6"
        },
        "Receptor":{
          "RUTRecep": paciente.rut,
          "RznSocRecep": paciente.nombre
        }
      },
      "Detalle":[],
      "LibreDTE": {
          "extra": {
            "venta": {
              "codigoPaciente": paciente.codigo,
              "ejecutivo": ejecutivo
            }
          }
        }
    };
    
    let total = 0;
  
    for (let service of services) {
      total = total + (service.monto * service.cantidad);
      body["Detalle"].push(
        {
          "IndExe": "1",
          "NmbItem": service.nombre,
          "QtyItem":service.cantidad,
          "PrcItem":service.monto,
          "CdgItem": service.codigo
        }
      );
    }
  
    const axios = require('axios')

    let options = {
      headers: {
        "Accept": "application/json",
        "Authorization": "ZXEzQ3hpeXM5V1AzOFF5MTZLUFlsMXpIZ2xqRmwxdDg6WA=="
      }
    }
  
    res = await axios.post("https://libredte.cl/api/dte/documentos/emitir?normalizar=1&formato=json&links=0&email=0", body, options);
    
    if (res.status == 200) {
      bodyGenerar = {
        "emisor": 78730160,
        "receptor": paciente.rut,
        "dte": 41,
        "codigo": res.data.codigo
      }
      
      let boletaEmitida = await axios.post(`https://libredte.cl/api/dte/documentos/generar?getXML=1&links=0&email=0&retry=${retry}&gzip=0`, bodyGenerar, options);
      
      if (boletaEmitida.status == 200) {
        let folioBoleta = parseInt(boletaEmitida.data.folio)
        
        await context.services.get("base-dte").db(database).collection("boleta-exenta").insertOne({
          "folio": folioBoleta,
          "servicios": services,
          "paciente": paciente,
          "ejecutivo": ejecutivo,
          "libredte": boletaEmitida.data
        });
        
        return { status: "200", folio: `${folioBoleta}`, monto: `${total}`, ejecutivo: ejecutivo, trackid: `${boletaEmitida.data.track_id}` };
        
      } else {
        return { status: "400" }
      }
    } else {
      return { status: "400" }
    }
  
}