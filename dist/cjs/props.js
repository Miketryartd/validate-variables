"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSchema = exports.EnvSchema = void 0;
exports.EnvSchema = {
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
exports.DatabaseSchema = {
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
