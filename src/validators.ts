
import { Schema, ValidationResult, ValidationOptions, Environment, ValidationError as ValidationErrorType } from './types';

function coerceValue(value: any, type: string, fieldSchema: any): any {
    if (!fieldSchema.coerce) return value;
    
    if (value === undefined || value === null) return value;
    
    switch (type) {
        case 'number':
            const num = Number(value);
            return isNaN(num) ? value : num;
        case 'boolean':
            if (value === 'true' || value === '1') return true;
            if (value === 'false' || value === '0') return false;
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

function validateField(value: any, fieldName: string, fieldSchema: any): string | null {
 
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

function validateNestedObject(
    data: any,
    schema: Schema,
    prefix: string = '',
    options: ValidationOptions = {}
): { errors: { field: string; message: string }[]; validatedData: Record<string, any> } {
    const errors: { field: string; message: string }[] = [];
    const validatedData: Record<string, any> = {};

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
            } catch (e) {
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

export function validate<T extends Record<string, any>>(
    data: any,
    schema: Schema,
    options: ValidationOptions = {}
): ValidationResult<T> {
    const { errors, validatedData } = validateNestedObject(data, schema, '', options);

    if (errors.length > 0) {
      
        const maskedErrors = errors.map(error => {
            const sensitiveFields = ['password', 'secret', 'key', 'token', 'api_key', 'auth'];
            const isSensitive = sensitiveFields.some(keyword => 
                error.field.toLowerCase().includes(keyword)
            );
            
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
        data: validatedData as T
    };
}

export class EnvValidator {
    private schema: Schema;
    private options: ValidationOptions = {};
    private sources: any[] = [];

    constructor(schema: Schema) {
        this.schema = schema;
    }

    env(environment: Environment) {
        this.options.environment = environment;
        return this;
    }

    allowMissingInDev(allow: boolean) {
        this.options.allowMissingInDev = allow;
        return this;
    }

    strictMode(strict: boolean) {
        this.options.strictMode = strict;
        return this;
    }

    from(source: any) {
        this.sources.push(source);
        return this;
    }

    fromEnvFile(filePath: string = '.env') {
    
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            try {
        
                const fs = require('fs');
                const path = require('path');
                const envContent = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
                const envVars: Record<string, string> = {};
                
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
            } catch (error) {
             
            }
        }
        return this;
    }

    parse<T extends Record<string, any> = Record<string, any>>(): ValidationResult<T> {
    
        let mergedData = {};
        for (const source of this.sources) {
            mergedData = { ...mergedData, ...source };
        }
        
        return validate<T>(mergedData, this.schema, this.options);
    }
}

export function validateEnv<T extends Record<string, any> = Record<string, any>>(
    schema: Schema
) {
    return new EnvValidator(schema);
}

export function isValid<T extends Record<string, any>>(
    data: any,
    schema: Schema
): data is T {
    const result = validate<T>(data, schema);
    return result.success;
}

export function assertValid<T extends Record<string, any>>(
    data: any,
    schema: Schema
): asserts data is T {
    const result = validate<T>(data, schema);
    if (!result.success) {
        throw new Error(
            `Validation failed:\n${result.errors.map(e => `  • ${e.field}: ${e.message}`).join('\n')}`
        );
    }
}

export class ValidationError extends Error {
    public readonly errors: ValidationErrorType['errors'];
    
    constructor(errors: ValidationErrorType['errors']) {
        const message = `Validation failed:\n${errors.map(e => `  • ${e.field}: ${e.message}`).join('\n')}`;
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

export class ConfigError extends Error {
    constructor(message: string, public readonly field?: string) {
        super(message);
        this.name = 'ConfigError';
    }
}

export function parseOrThrow<T extends Record<string, any>>(
    data: any,
    schema: Schema
): T {
    const result = validate<T>(data, schema);
    if (!result.success) {
        throw new ValidationError(result.errors);
    }
    return result.data;
}