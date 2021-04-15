/**
 * @param type @ExpectedValues 39, 41, 61
 * @Mixes Params
 */

/**
 * @type 39
 * @param
 * @param
 * @param
 * @param
 * @param
 * @param
 * @param
 * @param
 */

/**
 * @type 41
 * @param rut
 * @param nombre
 * @param codigo
 * @param ejecutivo
 * @param Detalle @Array 
            @param { "IndExe": "1" @string,
                    * "NmbItem": service.nombre @number,
                    * "QtyItem": service.cantidad @any,
                    * "PrcItem": service.monto @any,
                    * "CdgItem": service.codigo @any
            * }
  
 */


/**
 * @type 61
 * 
 */
exports = async function (type, params) {
    try {
        const Joi = require("joi")
        let body = {}
        switch (type) {
            case 39:
                body = {
                    "Encabezado": {
                        "IdDoc": {
                            "TipoDTE": 39,
                            "Folio": 1
                        },
                        "Emisor": {
                            "RUTEmisor": "76192083-9",
                            "RznSocEmisor": "SASCO SpA",
                            "GiroEmisor": "Servicios integrales de informática",
                            "DirOrigen": "Santiago",
                            "CmnaOrigen": "Santiago"
                        },
                        "Receptor": {
                            "RUTRecep": "66666666-6",
                            "RznSocRecep": "Sin RUT",
                            "DirRecep": "Santiago",
                            "CmnaRecep": "Santiago"
                        }
                    },
                    "Detalle": {
                        "NmbItem": "Producto",
                        "QtyItem": 1,
                        "PrcItem": 1190
                    }
                }
                break;
            case 41:
                const schema = Joi.object({
                    rut: Joi.string().required().label("rut"),
                    nombre: Joi.number().required().label("nombre"),
                    codigo: Joi.string().required().label("codigo"),
                    ejecutivo: Joi.string().required().label("ejecutivo"),
                    Detalle: Joi.array().items(
                        Joi.object({
                            IndExe: Joi.string().required("IndExe"),
                            NmbItem: Joi.any().required("NmbItem"),
                            QtyItem: Joi.number().required("QtyItem"),
                            PrcItem: Joi.number().required("PrcItem"),
                            CdgItem: Joi.any().required("CdgItem"),
                        })
                    ).required("Detalle")
                })

                const {
                    rut,
                    nombre,
                    codigo,
                    ejecutivo,
                    Detalle
                } = context.functions.excute("joiValidation", params, schema);

                body = {
                    "Encabezado": {
                        "IdDoc": {
                            "TipoDTE": 41
                        },
                        "Emisor": {
                            "RUTEmisor": "78730160-6"
                        },
                        "Receptor": {
                            "RUTRecep": rut,
                            "RznSocRecep": nombre
                        }
                    },
                    "Detalle": Detalle,
                    "LibreDTE": {
                        "extra": {
                            "venta": {
                                "codigoPaciente": codigo,
                                "ejecutivo": ejecutivo
                            }
                        }
                    }
                };
                break;
            case 61:
                body = {
                    "Encabezado": {
                        "IdDoc": {
                            "TipoDTE": 61,
                            "Folio": 1
                        },
                        "Emisor": {
                            "RUTEmisor": "76192083-9",
                            "RznSoc": "SASCO SpA",
                            "GiroEmis": "Servicios integrales de informática",
                            "Acteco": 726000,
                            "DirOrigen": "Santiago",
                            "CmnaOrigen": "Santiago"
                        },
                        "Receptor": {
                            "RUTRecep": "60803000-K",
                            "RznSocRecep": "Servicio de Impuestos Internos",
                            "GiroRecep": "Gobierno",
                            "DirRecep": "Santiago",
                            "CmnaRecep": "Santiago"
                        },
                        "Totales": {
                            "MntNeto": 0,
                            "TasaIVA": 19,
                            "IVA": 0,
                            "MntTotal": 0
                        }
                    },
                    "Detalle": [
                    ],
                    "Referencia": {
                        "TpoDocRef": 33,
                        "FolioRef": 1,
                        "FchRef": "2016-01-01",
                        "CodRef": 1,
                        "RazonRef": "Anula factura"
                    }
                }
                break;
            default:
                body = false;
        }
        return body;
    } catch (e) {
        throw e
    }

}