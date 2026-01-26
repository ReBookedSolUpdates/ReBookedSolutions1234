/**
 * Environment Variable Parser
 * Provides case-insensitive boolean parsing for environment variables
 */

/**
 * Parse an environment variable value as a boolean
 * Normalizes the input by trimming and lowercasing before comparison
 * Returns true only if the normalized value is exactly 'true'
 * Returns false otherwise (safe default)
 * 
 * @param value - The environment variable value to parse
 * @returns boolean - true if normalized value is 'true', false otherwise
 */
export function parseEnvBool(value?: string): boolean {
  if (!value) {
    return false;
  }
  return value.trim().toLowerCase() === 'true';
}

/**
 * Centralized production flag
 * Supports case variations: true, True, TRUE, etc.
 */
export const IS_PRODUCTION = parseEnvBool(import.meta.env.VITE_PRODUCTION);
