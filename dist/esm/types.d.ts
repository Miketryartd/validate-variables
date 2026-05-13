export interface SchemaField {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    coerce?: boolean;
    default?: any;
    secret?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp | string;
    min?: number;
    max?: number;
    schema?: Schema;
    transform?: (value: any) => any;
    validate?: (value: any) => boolean | string;
}
export type Schema = Record<string, SchemaField>;
export interface ValidationSuccess<T> {
    success: true;
    data: T;
}
export interface ValidationError {
    success: false;
    errors: {
        field: string;
        message: string;
    }[];
}
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;
export type Environment = 'development' | 'production' | 'test' | 'staging';
export interface ValidationOptions {
    environment?: Environment;
    allowMissingInDev?: boolean;
    strictMode?: boolean;
}
export type InferSchema<T extends Schema> = {
    [K in keyof T]: T[K]['type'] extends 'number' ? number : T[K]['type'] extends 'boolean' ? boolean : T[K]['type'] extends 'array' ? any[] : T[K]['type'] extends 'object' ? T[K]['schema'] extends Schema ? InferSchema<T[K]['schema']> : Record<string, any> : string;
};
export declare function partialSchema<T extends Schema>(schema: T, fields: (keyof T)[]): Partial<T>;
export declare function pickSchema<T extends Schema>(schema: T, fields: (keyof T)[]): T;
export declare function omitSchema<T extends Schema>(schema: T, fields: (keyof T)[]): T;
export declare function extendSchema<T extends Schema, U extends Schema>(base: T, extension: U): T & U;
export declare function isValidationError<T>(result: ValidationResult<T>): result is ValidationError;
export declare function isValidationSuccess<T>(result: ValidationResult<T>): result is ValidationSuccess<T>;
