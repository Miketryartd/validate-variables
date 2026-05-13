
import { Schema, SchemaField, ValidationResult } from './types';


export function validate<T extends Record<string, any>>(
  data: any,
  schema: Schema
): ValidationResult<T> {
  const errors: { field: string; message: string }[] = [];
  const validatedData: Record<string, any> = {};

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
    data: validatedData as T
  };
}


export function validateEnv<T extends Record<string, any>>(
  schema: Schema
) {
  return {
    parse: (data: any): ValidationResult<T> => {
      return validate<T>(data, schema);
    }
  };
}