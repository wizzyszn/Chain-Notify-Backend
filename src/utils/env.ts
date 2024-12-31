export function getEnvVar(key : string, defaultValue? : string) : string{
    const value = process.env[key];
    if(!value && !defaultValue) throw Error(`Environment variable ${key} is missing`);
    return value || defaultValue!
}