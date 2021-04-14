exports = async function(monto){
  /*
    Accessing application's values:
    var x = context.values.get("value_name");

    Accessing a mongodb service:
    var collection = context.services.get("mongodb-atlas").db("dbname").collection("coll_name");
    var doc = collection.findOne({owner_id: context.user.id});

    To call other named functions:
    var result = context.functions.execute("function_name", arg1, arg2);

    Try running in the console below.
  */
  if (!isNaN(monto) || monto <= 0) {
    return {status: "400", data: ""};
  }
  
  const axios = require('axios')
  
  const caf = context.values.get("caf-base64");
  const certData = context.values.get("cert-data");
  const pkeyData = context.values.get("pkey-data");
  const uri = context.values.get("generar-xml-uri");
  const resolucion = context.values.get("sii-resolucion-boletas");
  const libreDTEAuthHeader = context.values.get("libredte-authorizarion-header");
  
  let siiAuthObject = context.values.get("sii-auth-object");
  siiAuthObject.cert["cert-data"] = certData;
  siiAuthObject.cert["pkey-data"] = pkeyData;
  
  let boletaDTE = context.values.get("sii-dte-boleta-exenta");
  boletaDTE["Detalle"]["PrcItem"] = parseInt(monto) || 0;
  
  let payload = {
    auth : siiAuthObject,
    dte: boletaDTE,
    resolucion: resolucion,
    caf: caf
  }
  
  let options = {
    headers: {
      "Accept": "application/json",
      "Authorization": libreDTEAuthHeader
    }
  }
  
  res = await axios.post(uri, payload, options);
  
  return EJSON.parse({status: `${res.status}`, data: res.data.xml.dte});
};