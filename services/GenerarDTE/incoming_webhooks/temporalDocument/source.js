// This function is the webhook's request handler.
// exports({query: {servicios: '[{"monto": 1000, "codigo": 1, "nombre": "1", "cantidad": 1}]', paciente: '{"nombre": "nombre paciente", "codigo": 1, "rut": "16211150-7"}', ejecutivo: "nombre ejecutivo"}})

exports = async function (payload, response) {
  try{
        const Joi = require('joi');
        const servicesURI = decodeURIComponent(payload.query.servicios),
            pacienteURI = decodeURIComponent(payload.query.paciente);

        let ejecutivoURI = decodeURIComponent(payload.query.ejecutivo);

        const boletaExenta = context.services.get("base-dte").db(database).collection("boleta-exenta")
        const produccion = payload.query.produccion || 0;

        let database = produccion == 1 ? "dte-production" : "dte", retry = produccion == 1 ? 10 : 0,
            servicesData = {},
            pacienteData = {},
            boletaUri = "generar-xml-uri";
        const getFunction = (functionName, values) => {
            return context.functions(functionName, ...values)
        }

        try {
            servicesData = JSON.parse(servicesURI);
            pacienteData = JSON.parse(pacienteURI);
        } catch (err) {
            return { "status": "400", message: "Los parámetros de entrada no son un JSON válido." }
        }

        const {
          services,
          paciente
        } = getFunction("joiValidation", {
          data: {
            services: services,
            paciente: paciente
          }, schemaJson:
            Joi.object({
                services: Joi.array().items(
                    Joi.object({
                        monto:  Joi.number().required("monto"),
                        codigo: Joi.number().required("codigo"),
                        nombre: Joi.any().required().label("nombre"),
                        cantidad: Joi.number().required().greater(0).label("cantidad")
                    })
                ).required().label("Services"),
                paciente: Joi.object({
                    codigo: Joi.number().required("codigo"),
                    nombre: Joi.any().required().label("nombre"),
                    rut: Joi.any().required().label("cantidad")
                }).required().label("paciente"),
            })
        });

        return { status: 200 , success: "Validated"}
  }catch(e){
    return  { status: "400", success: e.message}
  }

  /* for (let service of services) {
    if (isNaN(service.monto) || isNaN(service.codigo) || !service.nombre || service.monto <= 0 || isNaN(service.cantidad) || service.cantidad <= 0) {
      return { status: "400", message: "Uno o más valores de los servicios no son válidos." }
    }
  }

  if (!paciente.nombre || !paciente.codigo || !paciente.rut) {
    return { status: "400", message: "Uno o más valores del paciente no son válidos." }
  } */

  /* if (typeof (ejecutivoURI) == "undefined" || !ejecutivoURI || ejecutivoURI == "") {
    ejecutivoURI = "-";
  } */

}