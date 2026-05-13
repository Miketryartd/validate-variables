import { Schema, ValidationResult } from './types';
export declare function validate<T extends Record<string, any>>(data: any, schema: Schema): ValidationResult<T>;
export declare function validateEnv<T extends Record<string, any>>(schema: Schema): {
    parse: (data: any) => ValidationResult<T>;
};
