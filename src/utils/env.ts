/**
 * Environment variable validation and access utilities
 * Provides type-safe access to environment variables with validation
 */

/**
 * Environment variable schema for validation
 * Note: This interface serves as documentation and type reference
 */
// interface EnvSchema {
//   VITE_APP_NAME: string
//   VITE_APP_VERSION: string
//   VITE_APP_ENVIRONMENT: 'development' | 'production' | 'test'
//   VITE_DEV_MODE: string
//   VITE_DEBUG_ENABLED: string
//   VITE_ENABLE_ANALYTICS: string
//   VITE_ENABLE_ERROR_REPORTING: string
// }

/**
 * Validates that a required environment variable exists and is not empty
 * @param key - The environment variable key
 * @param value - The environment variable value
 * @throws Error if the variable is missing or empty
 */
function validateRequiredEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Validates that an environment variable is one of the allowed values
 * @param key - The environment variable key
 * @param value - The environment variable value
 * @param allowedValues - Array of allowed values
 * @throws Error if the value is not in the allowed list
 */
function validateEnumEnv<T extends string>(
  key: string,
  value: string | undefined,
  allowedValues: readonly T[]
): T {
  if (!value || !allowedValues.includes(value as T)) {
    throw new Error(
      `Invalid value for ${key}: ${value}. Must be one of: ${allowedValues.join(', ')}`
    )
  }
  return value as T
}

/**
 * Converts string environment variable to boolean
 * @param value - String value to convert ('true', 'false', '1', '0')
 * @returns Boolean value
 */
function parseEnvBoolean(value: string | undefined): boolean {
  if (!value) return false
  const normalizedValue = value.toLowerCase().trim()
  return normalizedValue === 'true' || normalizedValue === '1'
}

/**
 * Validated environment variables with proper types
 */
export const env = {
  // App Information
  APP_NAME: validateRequiredEnv(
    'VITE_APP_NAME',
    import.meta.env['VITE_APP_NAME'] as string
  ),
  APP_VERSION: validateRequiredEnv(
    'VITE_APP_VERSION',
    import.meta.env['VITE_APP_VERSION'] as string
  ),
  APP_ENVIRONMENT: validateEnumEnv(
    'VITE_APP_ENVIRONMENT',
    import.meta.env['VITE_APP_ENVIRONMENT'] as string,
    ['development', 'production', 'test'] as const
  ),

  // Development Settings
  IS_DEV_MODE: parseEnvBoolean(import.meta.env['VITE_DEV_MODE'] as string),
  IS_DEBUG_ENABLED: parseEnvBoolean(
    import.meta.env['VITE_DEBUG_ENABLED'] as string
  ),

  // Feature Flags
  IS_ANALYTICS_ENABLED: parseEnvBoolean(
    import.meta.env['VITE_ENABLE_ANALYTICS'] as string
  ),
  IS_ERROR_REPORTING_ENABLED: parseEnvBoolean(
    import.meta.env['VITE_ENABLE_ERROR_REPORTING'] as string
  ),

  // Environment Checks
  get isDevelopment() {
    return this.APP_ENVIRONMENT === 'development'
  },

  get isProduction() {
    return this.APP_ENVIRONMENT === 'production'
  },

  get isTest() {
    return this.APP_ENVIRONMENT === 'test'
  },
} as const

/**
 * Firebase environment variables
 */
export const firebaseEnv = {
  API_KEY: import.meta.env['VITE_FIREBASE_API_KEY'] as string,
  AUTH_DOMAIN: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'] as string,
  PROJECT_ID: import.meta.env['VITE_FIREBASE_PROJECT_ID'] as string,
  STORAGE_BUCKET: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'] as string,
  MESSAGING_SENDER_ID: import.meta.env[
    'VITE_FIREBASE_MESSAGING_SENDER_ID'
  ] as string,
  APP_ID: import.meta.env['VITE_FIREBASE_APP_ID'] as string,
  USE_EMULATOR: parseEnvBoolean(
    import.meta.env['VITE_FIREBASE_USE_EMULATOR'] as string
  ),
  USE_FIREBASE: parseEnvBoolean(import.meta.env['VITE_USE_FIREBASE'] as string),
} as const

/**
 * Validates all required environment variables on app startup
 * Should be called early in the application lifecycle
 * @throws Error if any required environment variables are invalid
 */
export function validateEnvironment(): void {
  try {
    // Trigger validation by accessing all properties
    const {
      APP_NAME,
      APP_VERSION,
      APP_ENVIRONMENT,
      IS_DEV_MODE,
      IS_DEBUG_ENABLED,
      IS_ANALYTICS_ENABLED,
      IS_ERROR_REPORTING_ENABLED,
    } = env

    console.log('✅ Environment validation passed', {
      APP_NAME,
      APP_VERSION,
      APP_ENVIRONMENT,
      IS_DEV_MODE,
      IS_DEBUG_ENABLED,
      IS_ANALYTICS_ENABLED,
      IS_ERROR_REPORTING_ENABLED,
    })
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw error
  }
}
