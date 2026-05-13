
# validate-variables

A lightweight, specialized TypeScript validator for environment variables and configuration with built-in coercion, secret masking, and nested object support.

**Bundle Size:** ~3KB

## Features

- **Auto-coercion** - String → Number, Boolean, Array
- **Secret masking** - Automatic sensitive data protection in errors
- **Nested objects** - Deep validation of complex configs
- **Custom transforms & validators** - Modify and validate values
- **Environment-aware** - Different rules for dev/prod
- **Multiple sources** - Merge from env, files, secret managers
- **Zero dependencies** - Lightweight and fast
- **Full TypeScript** - Complete type inference

## Installation


```bash
npm install miketryartd-validate-variables
```
## Usage
```typescript
import { validateEnv, EnvSchema, InferSchema, isValid, parseOrThrow } from 'miketryartd-validate-variables';

// Basic validation
const result = validateEnv(EnvSchema)
    .env('production')
    .from(process.env)
    .parse();

if (result.success) {
    console.log(result.data.PORT);        // number (auto-coerced)
    console.log(result.data.ALLOWED_ORIGINS); // string[]
} else {
    result.errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
    });
}

// Auto-coercion
const schema = {
    PORT: { type: 'number', coerce: true },     // "3000" → 3000
    DEBUG: { type: 'boolean', coerce: true },   // "true" → true
    ORIGINS: { type: 'array', coerce: true }    // "a,b,c" → ["a","b","c"]
};

// Nested objects
const schema = {
    database: {
        type: 'object',
        schema: {
            host: { type: 'string', required: true },
            port: { type: 'number', coerce: true }
        }
    }
};

// Custom transforms & validation
const schema = {
    CACHE_TTL: {
        type: 'number',
        coerce: true,
        transform: (seconds) => seconds * 1000,  // Convert to ms
        validate: (value) => value > 0 || 'Must be positive'
    },
    LOG_LEVEL: {
        type: 'string',
        required: true,
        validate: (level) => ['error', 'warn', 'info'].includes(level)
    }
};

// Environment-aware rules
const result = validateEnv(schema)
    .env('development')
    .allowMissingInDev(true)  // Skip required checks in dev
    .strictMode(false)        // Allow extra fields
    .parse();

// Multiple data sources
const config = validateEnv(schema)
    .from(process.env)           // Environment variables
    .fromEnvFile('.env')         // .env file
    .from(require('./config.json')) // JSON file
    .env('production')
    .parse();

// Type inference
type Config = InferSchema<typeof schema>;

// Utility functions
if (isValid(data, schema)) {
    console.log(data.PORT); // TypeScript knows it's valid
}

assertValid(data, schema); // Throws on error
const config = parseOrThrow(data, schema); // Returns typed data or throws


// Schema helpers
import { pickSchema, omitSchema, extendSchema } from 'miketryartd-validate-variables';

const picked = pickSchema(EnvSchema, ['PORT', 'DEBUG']);
const omitted = omitSchema(EnvSchema, ['API_KEY']);
const extended = extendSchema(EnvSchema, { NEW: { type: 'string' } });
API
SchemaField Options
Option	Type	Description
type	'string' | 'number' | 'boolean' | 'array' | 'object'	Value type
required	boolean	Is field required?
coerce	boolean	Auto-convert from string
default	any	Default value
secret	boolean	Mask in errors
min/max	number	Number bounds
minLength/maxLength	number	String length
pattern	RegExp | string	Regex pattern
schema	Schema	Nested schema
transform	(value) => any	Transform value
validate	(value) => boolean | string	Custom validation
Pre-built Schemas
EnvSchema - Standard environment variables

DatabaseSchema - Database configuration

RedisSchema - Redis configuration

AppConfigSchema - Complete application config
```
License
MIT
Author: Miketryartd