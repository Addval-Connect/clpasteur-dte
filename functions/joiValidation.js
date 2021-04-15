exports = async function (data, schemaJson) {
    const Joi = require('joi');
    const _ = require('lodash')
    const schema = Joi.object(schemaJson);
    const validate = schema.validate(data, { abortEarly: false, allowUnknown: true });
    if (validate.error) {
        const errorArray = _.map(_.get(validate, 'error.details'), detail => {
            return detail.message;
        })
        throw new Error(errorArray.join(', '));
    }
    return data;
};