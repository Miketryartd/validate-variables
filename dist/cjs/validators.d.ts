import { Schema, ValidationResult, ValidationOptions, Environment, ValidationError as ValidationErrorType } from './types';
export declare function validate<T extends Record<string, any>>(data: any, schema: Schema, options?: ValidationOptions): ValidationResult<T>;
export declare class EnvValidator {
    private schema;
    private options;
    private sources;
    constructor(schema: Schema);
    env(environment: Environment): this;
    allowMissingInDev(allow: boolean): this;
    strictMode(strict: boolean): this;
    from(source: any): this;
    fromEnvFile(filePath?: string): this;
    parse<T extends Record<string, any> = Record<string, any>>(): ValidationResult<T>;
}
export declare function validateEnv<T extends Record<string, any> = Record<string, any>>(schema: Schema): EnvValidator;
export declare function isValid<T extends Record<string, any>>(data: any, schema: Schema): data is T;
export declare function assertValid<T extends Record<string, any>>(data: any, schema: Schema): asserts data is T;
export declare class ValidationError extends Error {
    readonly errors: ValidationErrorType['errors'];
    constructor(errors: ValidationErrorType['errors']);
}
export declare class ConfigError extends Error {
    readonly field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare function parseOrThrow<T extends Record<string, any>>(data: any, schema: Schema): T;
