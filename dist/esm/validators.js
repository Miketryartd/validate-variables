export function validate(data, schema) {
    const errors = [];
    const validatedData = {};
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        const value = data[fieldName];
        if (fieldSchema.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`
            });
            continue;
        }
        if (value === undefined || value === null) {
            if (fieldSchema.default !== undefined) {
                validatedData[fieldName] = fieldSchema.default;
            }
            continue;
        }
        const actualType = typeof value;
        if (actualType !== fieldSchema.type) {
            errors.push({
                field: fieldName,
                message: `${fieldName} should be ${fieldSchema.type}, but got ${actualType}`
            });
            continue;
        }
        validatedData[fieldName] = value;
    }
    if (errors.length > 0) {
        return {
            success: false,
            errors
        };
    }
    return {
        success: true,
        data: validatedData
    };
}
export function validateEnv(schema) {
    return {
        parse: (data) => {
            return validate(data, schema);
        }
    };
}
