# validate-variables

A TypeScript validator for environment variables and configuration, similar to Zod.

## Installation

```bash
npm install miketryartd-validate-variables
```

## Usage

```typescript
import { validateEnv, EnvSchema } from 'validate-variables';

const result = validateEnv(EnvSchema).parse(process.env);

if (result.success) {
  console.log(result.data);
} else {
  result.errors.forEach(err => {
    console.log(`${err.field}: ${err.message}`);
  });
}
```

## License

MIT