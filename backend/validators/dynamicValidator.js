const Joi = require("joi");

 
/**
 * Generates a string validation schema
 * @param {Object} options - Validation options
 * @param {string} options.label - Field label for error messages
 * @param {number} options.min - Minimum length (optional)
 * @param {number} options.max - Maximum length (optional)
 * @param {boolean} options.required - Whether the field is required (default: false)
 * @param {RegExp} options.pattern - Regex pattern for validation (optional)
 * @returns {Joi.StringSchema} Joi string schema
 */
const stringValidation = ({ label, min, max, required = false, pattern } = {}) => {
    let schema = Joi.string().label(label);

    if (min) schema = schema.min(min);
    if (max) schema = schema.max(max);
    if (pattern) schema = schema.pattern(pattern);
    if (required) schema = schema.required();

    return schema;
};

/**
 * Generates a number validation schema
 * @param {Object} options - Validation options
 * @param {string} options.label - Field label for error messages
 * @param {number} options.min - Minimum value (optional)
 * @param {number} options.max - Maximum value (optional)
 * @param {boolean} options.required - Whether the field is required (default: false)
 * @returns {Joi.NumberSchema} Joi number schema
 */
const numberValidation = ({ label, min, max, required = false } = {}) => {
    let schema = Joi.number().label(label);

    if (min !== undefined) schema = schema.min(min);
    if (max !== undefined) schema = schema.max(max);
    if (required) schema = schema.required();

    return schema;
};

/**
 * Generates an image validation schema
 * @param {Object} options - Validation options
 * @param {string} options.label - Field label for error messages
 * @param {Array<string>} options.allowedTypes - Allowed image MIME types
 * @param {number} options.maxSize - Maximum file size in bytes (optional)
 * @param {boolean} options.required - Whether the field is required (default: false)
 * @returns {Joi.ObjectSchema} Joi object schema for image validation
 */
const imageValidation = ({ label, allowedTypes, maxSize, required = false } = {}) => {
    let schema = Joi.object({
        filename: Joi.string().required().label(`${label} Filename`),
        mimetype: Joi.string()
            .valid(...allowedTypes)
            .required()
            .label(`${label} Type`),
        size: Joi.number().max(maxSize).label(`${label} Size`),
    }).label(label);

    if (required) schema = schema.required();

    return schema;
};

module.exports = {
    stringValidation,
    numberValidation,
    imageValidation,
};
