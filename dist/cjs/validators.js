"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = exports.ValidationError = exports.EnvValidator = void 0;
exports.validate = validate;
exports.validateEnv = validateEnv;
exports.isValid = isValid;
exports.assertValid = assertValid;
exports.parseOrThrow = parseOrThrow;
function coerceValue(value, type, fieldSchema) {
    if (!fieldSchema.coerce)
        return value;
    if (value === undefined || value === null)
        return value;
    switch (type) {
        case 'number':
            const num = Number(value);
            return isNaN(num) ? value : num;
        case 'boolean':
            if (value === 'true' || value === '1')
                return true;
            if (value === 'false' || value === '0')
                return false;
            return Boolean(value);
        case 'array':
            if (typeof value === 'string') {
                return value.split(',').map(item => item.trim());
            }
            return Array.isArray(value) ? value : [value];
        default:
            return value;
    }
}
function validateField(value, fieldName, fieldSchema) {
    if (fieldSchema.type === 'array' && !Array.isArray(value)) {
        return `${fieldName} should be an array, but got ${typeof value}`;
    }
    if (fieldSchema.type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
        return `${fieldName} should be an object, but got ${typeof value}`;
    }
    if (fieldSchema.type === 'string' && typeof value === 'string') {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
            return `${fieldName} must be at least ${fieldSchema.minLength} characters`;
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
            return `${fieldName} must be at most ${fieldSchema.maxLength} characters`;
        }
        if (fieldSchema.pattern) {
            const regex = fieldSchema.pattern instanceof RegExp
                ? fieldSchema.pattern
                : new RegExp(fieldSchema.pattern);
            if (!regex.test(value)) {
                return `${fieldName} does not match required pattern`;
            }
        }
    }
    if (fieldSchema.type === 'number' && typeof value === 'number') {
        if (fieldSchema.min !== undefined && value < fieldSchema.min) {
            return `${fieldName} must be at least ${fieldSchema.min}`;
        }
        if (fieldSchema.max !== undefined && value > fieldSchema.max) {
            return `${fieldName} must be at most ${fieldSchema.max}`;
        }
    }
    if (fieldSchema.validate) {
        const result = fieldSchema.validate(value);
        if (result === false) {
            return `${fieldName} failed custom validation`;
        }
        if (typeof result === 'string') {
            return result;
        }
    }
    return null;
}
function validateNestedObject(data, schema, prefix = '', options = {}) {
    const errors = [];
    const validatedData = {};
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;
        let value = data[fieldName];
        const isMissing = value === undefined || value === null || value === '';
        if (fieldSchema.required && isMissing) {
            if (options.allowMissingInDev && options.environment === 'development') {
                if (fieldSchema.default !== undefined) {
                    validatedData[fieldName] = fieldSchema.default;
                }
                continue;
            }
            errors.push({
                field: fullPath,
                message: `${fullPath} is required`
            });
            continue;
        }
        if (isMissing) {
            if (fieldSchema.default !== undefined) {
                validatedData[fieldName] = fieldSchema.default;
            }
            continue;
        }
        let coercedValue = coerceValue(value, fieldSchema.type, fieldSchema);
        if (fieldSchema.type === 'object' && fieldSchema.schema) {
            const nested = validateNestedObject(coercedValue || {}, fieldSchema.schema, fullPath, options);
            errors.push(...nested.errors);
            validatedData[fieldName] = nested.validatedData;
            continue;
        }
        const actualType = fieldSchema.type === 'array' ? 'array' : typeof coercedValue;
        const expectedType = fieldSchema.type === 'array' ? 'array' : fieldSchema.type;
        if (expectedType !== actualType) {
            errors.push({
                field: fullPath,
                message: `${fullPath} should be ${expectedType}, but got ${actualType}`
            });
            continue;
        }
        const validationError = validateField(coercedValue, fullPath, fieldSchema);
        if (validationError) {
            errors.push({
                field: fullPath,
                message: validationError
            });
            continue;
        }
        if (fieldSchema.transform) {
            try {
                coercedValue = fieldSchema.transform(coercedValue);
            }
            catch (e) {
                errors.push({
                    field: fullPath,
                    message: `${fullPath} transformation failed: ${e}`
                });
                continue;
            }
        }
        validatedData[fieldName] = coercedValue;
    }
    return { errors, validatedData };
}
function validate(data, schema, options = {}) {
    const { errors, validatedData } = validateNestedObject(data, schema, '', options);
    if (errors.length > 0) {
        const maskedErrors = errors.map(error => {
            const sensitiveFields = ['password', 'secret', 'key', 'token', 'api_key', 'auth'];
            const isSensitive = sensitiveFields.some(keyword => error.field.toLowerCase().includes(keyword));
            if (isSensitive) {
                return {
                    ...error,
                    message: error.message.replace(/[a-zA-Z0-9_-]{8,}/g, '***MASKED***')
                };
            }
            return error;
        });
        return {
            success: false,
            errors: maskedErrors
        };
    }
    return {
        success: true,
        data: validatedData
    };
}
class EnvValidator {
    constructor(schema) {
        this.options = {};
        this.sources = [];
        this.schema = schema;
    }
    env(environment) {
        this.options.environment = environment;
        return this;
    }
    allowMissingInDev(allow) {
        this.options.allowMissingInDev = allow;
        return this;
    }
    strictMode(strict) {
        this.options.strictMode = strict;
        return this;
    }
    from(source) {
        this.sources.push(source);
        return this;
    }
    fromEnvFile(filePath = '.env') {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            try {
                const fs = require('fs');
                const path = require('path');
                const envContent = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
                const envVars = {};
                const lines = envContent.split('\n');
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine && !trimmedLine.startsWith('#')) {
                        const [key, ...valueParts] = trimmedLine.split('=');
                        if (key && valueParts.length) {
                            envVars[key.trim()] = valueParts.join('=').trim();
                        }
                    }
                }
                this.sources.push(envVars);
            }
            catch (error) {
            }
        }
        return this;
    }
    parse() {
        let mergedData = {};
        for (const source of this.sources) {
            mergedData = { ...mergedData, ...source };
        }
        return validate(mergedData, this.schema, this.options);
    }
}
exports.EnvValidator = EnvValidator;
function validateEnv(schema) {
    return new EnvValidator(schema);
}
function isValid(data, schema) {
    const result = validate(data, schema);
    return result.success;
}
function assertValid(data, schema) {
    const result = validate(data, schema);
    if (!result.success) {
        throw new Error(`Validation failed:\n${result.errors.map(e => `  • ${e.field}: ${e.message}`).join('\n')}`);
    }
}
class ValidationError extends Error {
    constructor(errors) {
        const message = `Validation failed:\n${errors.map(e => `  • ${e.field}: ${e.message}`).join('\n')}`;
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
class ConfigError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
function parseOrThrow(data, schema) {
    const result = validate(data, schema);
    if (!result.success) {
        throw new ValidationError(result.errors);
    }
    return result.data;
}
