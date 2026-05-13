function parseURL(urlString) {
    const match = urlString.match(/^(\w+):\/\/([^/:]+)(?::(\d+))?(.*)$/);
    if (match) {
        return {
            protocol: match[1] + ':',
            hostname: match[2],
            port: match[3] || '',
            pathname: match[4] || '',
            href: urlString,
            toString: () => urlString
        };
    }
    return {
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        href: urlString,
        toString: () => urlString
    };
}
export const EnvSchema = {
    NODE_ENV: {
        type: 'string',
        required: true,
        coerce: true,
        validate: (value) => ['development', 'production', 'test'].includes(value)
    },
    PORT: {
        type: 'number',
        required: true,
        coerce: true,
        min: 1000,
        max: 9999,
        default: 3000
    },
    DEBUG: {
        type: 'boolean',
        required: false,
        coerce: true,
        default: false
    },
    API_KEY: {
        type: 'string',
        required: true,
        secret: true,
        minLength: 32,
        pattern: '^sk-[a-zA-Z0-9]{32,}$'
    },
    ALLOWED_ORIGINS: {
        type: 'array',
        coerce: true,
        required: true,
        default: ['http://localhost:3000'],
        transform: (origins) => origins.map(o => parseURL(o))
    },
    DATABASE_URL: {
        type: 'string',
        required: true,
        secret: true,
        transform: (url) => parseURL(url),
        validate: (url) => {
            return url.protocol === 'postgresql:' || 'Must be a PostgreSQL URL';
        }
    }
};
export const DatabaseSchema = {
    host: {
        type: 'string',
        required: true,
        coerce: true
    },
    port: {
        type: 'number',
        required: true,
        coerce: true,
        min: 1,
        max: 65535
    },
    username: {
        type: 'string',
        required: true,
        coerce: true
    },
    password: {
        type: 'string',
        required: true,
        secret: true,
        coerce: true
    },
    ssl: {
        type: 'object',
        required: false,
        schema: {
            enabled: {
                type: 'boolean',
                coerce: true,
                default: false
            },
            ca: {
                type: 'string',
                required: false,
                coerce: true
            }
        }
    }
};
export const RedisSchema = {
    host: {
        type: 'string',
        required: true,
        coerce: true,
        default: 'localhost'
    },
    port: {
        type: 'number',
        required: true,
        coerce: true,
        default: 6379,
        min: 1,
        max: 65535
    },
    password: {
        type: 'string',
        required: false,
        secret: true,
        coerce: true
    },
    db: {
        type: 'number',
        coerce: true,
        default: 0,
        min: 0,
        max: 15
    }
};
export const AppConfigSchema = {
    env: {
        type: 'object',
        required: true,
        schema: EnvSchema
    },
    database: {
        type: 'object',
        required: true,
        schema: DatabaseSchema
    },
    redis: {
        type: 'object',
        required: false,
        schema: RedisSchema
    },
    features: {
        type: 'object',
        required: false,
        schema: {
            analytics: {
                type: 'boolean',
                coerce: true,
                default: false
            },
            caching: {
                type: 'boolean',
                coerce: true,
                default: true
            },
            rateLimit: {
                type: 'object',
                schema: {
                    enabled: {
                        type: 'boolean',
                        coerce: true,
                        default: true
                    },
                    maxRequests: {
                        type: 'number',
                        coerce: true,
                        default: 100,
                        min: 1
                    },
                    windowMs: {
                        type: 'number',
                        coerce: true,
                        default: 60000
                    }
                }
            }
        }
    }
};
