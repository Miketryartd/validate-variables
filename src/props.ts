import { Schema } from "./types";

export const EnvSchema: Schema = {
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

export const DatabaseSchema: Schema = {
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