exports = async function (url, method = 'GET', data = {}, headers = {}) {
    const axios = require("axios");
    try {
        const config = {
            url: url,
            method: method,
            headers: headers
        }
        if (method.toLowerCase() === 'post') config.data = data;
        let res = await axios(config);
        return res.data;
    } catch (e) {
        return e
    }
}