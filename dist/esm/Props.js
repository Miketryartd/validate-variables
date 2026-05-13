export const EnvSchema = {
    env: {
        type: 'string',
        required: true
    },
    database_uri: {
        type: 'string',
        required: true
    },
    api_key: {
        type: 'string',
        required: true,
    }
};
export const DatabaseSchema = {
    host: {
        type: 'string',
        required: true
    },
    port: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    }
};
