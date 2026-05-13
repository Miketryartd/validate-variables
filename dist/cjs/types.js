"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partialSchema = partialSchema;
exports.pickSchema = pickSchema;
exports.omitSchema = omitSchema;
exports.extendSchema = extendSchema;
exports.isValidationError = isValidationError;
exports.isValidationSuccess = isValidationSuccess;
function partialSchema(schema, fields) {
    const partial = {};
    for (const field of fields) {
        if (schema[field]) {
            partial[field] = { ...schema[field], required: false };
        }
    }
    return partial;
}
function pickSchema(schema, fields) {
    const picked = {};
    for (const field of fields) {
        if (schema[field]) {
            picked[field] = schema[field];
        }
    }
    return picked;
}
function omitSchema(schema, fields) {
    const omitted = { ...schema };
    for (const field of fields) {
        delete omitted[field];
    }
    return omitted;
}
function extendSchema(base, extension) {
    return { ...base, ...extension };
}
function isValidationError(result) {
    return !result.success;
}
function isValidationSuccess(result) {
    return result.success;
}
