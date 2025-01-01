"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVar = getEnvVar;
function getEnvVar(key, defaultValue) {
    const value = process.env[key];
    if (!value && !defaultValue)
        throw Error(`Environment variable ${key} is missing`);
    return value || defaultValue;
}
