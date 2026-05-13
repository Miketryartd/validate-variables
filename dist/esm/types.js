export function partialSchema(schema, fields) {
    const partial = {};
    for (const field of fields) {
        if (schema[field]) {
            partial[field] = { ...schema[field], required: false };
        }
    }
    return partial;
}
export function pickSchema(schema, fields) {
    const picked = {};
    for (const field of fields) {
        if (schema[field]) {
            picked[field] = schema[field];
        }
    }
    return picked;
}
export function omitSchema(schema, fields) {
    const omitted = { ...schema };
    for (const field of fields) {
        delete omitted[field];
    }
    return omitted;
}
export function extendSchema(base, extension) {
    return { ...base, ...extension };
}
export function isValidationError(result) {
    return !result.success;
}
export function isValidationSuccess(result) {
    return result.success;
}
