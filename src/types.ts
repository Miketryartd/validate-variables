
export interface SchemaField {
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
    default?: any
};


export type Schema = Record<string, SchemaField>;

export interface ValidationSuccess<T> {
    success: true
    data: T
};

export interface ValidationError {
    success: false;
    errors: {
        field: string;
        message: string;
    }[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;