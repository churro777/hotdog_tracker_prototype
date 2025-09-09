/**
 * Error logging utility for centralized error handling and reporting
 */

export interface ErrorLogEntry {
  message: string
  error?: Error
  context?: string
  timestamp: Date
  userId?: string
  action?: string
}

/**
 * Centralized error logging function
 * @param entry - Error log entry with message, error, and context
 */
export function logError(entry: Omit<ErrorLogEntry, 'timestamp'>): void {
  const logEntry: ErrorLogEntry = {
    ...entry,
    timestamp: new Date(),
  }

  // Always log to console in development and test environments
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    console.error(`[Error] ${logEntry.message}`, {
      context: logEntry.context,
      action: logEntry.action,
      userId: logEntry.userId,
      timestamp: logEntry.timestamp,
      error: logEntry.error,
    })
  }

  // In production, you might want to send errors to a logging service
  // For now, we'll just log to console but you could extend this to:
  // - Send to Sentry, LogRocket, or similar service
  // - Store in localStorage for offline reporting
  // - Send to your backend API

  if (import.meta.env.PROD) {
    // Simplified production logging (no stack traces for security)
    console.error(`[Error] ${logEntry.message}`, {
      context: logEntry.context,
      timestamp: logEntry.timestamp,
    })
  }
}

/**
 * Log a user action error
 * @param message - Error message
 * @param error - The error object
 * @param userId - User ID who triggered the error
 * @param action - The action that caused the error
 */
export function logUserError(
  message: string,
  error: Error,
  userId?: string,
  action?: string
): void {
  logError({
    message,
    error,
    context: 'user-action',
    ...(userId !== undefined && { userId }),
    ...(action !== undefined && { action }),
  })
}

/**
 * Log a storage error (localStorage, etc.)
 * @param message - Error message
 * @param error - The error object
 * @param key - The storage key that caused the error
 */
export function logStorageError(
  message: string,
  error: Error,
  key?: string
): void {
  logError({
    message,
    error,
    context: 'storage',
    ...(key && { action: `key: ${key}` }),
  })
}

/**
 * Log a data validation error
 * @param message - Error message
 * @param data - The invalid data (will be stringified)
 * @param validator - The validator that failed
 */
export function logValidationError(
  message: string,
  data: unknown,
  validator?: string
): void {
  let dataString: string
  try {
    dataString = JSON.stringify(data, null, 2)
  } catch {
    // Handle circular references or other JSON.stringify errors
    dataString = `[Circular/Complex Object: ${typeof data}]`
  }

  logError({
    message,
    context: 'validation',
    ...(validator !== undefined && { action: validator }),
    error: new Error(`Invalid data: ${dataString}`),
  })
}

/**
 * Log a critical Firebase connection error
 * @param message - Error message
 * @param error - The error object
 * @param collection - The Firebase collection that failed
 */
export function logFirebaseError(
  message: string,
  error: Error,
  collection?: string
): void {
  logError({
    message: `🔥 FIREBASE ERROR: ${message}`,
    error,
    context: 'firebase-critical',
    ...(collection && { action: `collection: ${collection}` }),
  })

  // In production, also send to localStorage for health checking
  if (import.meta.env.PROD) {
    try {
      const healthErrorsRaw = localStorage.getItem('app-health-errors') ?? '[]'
      const healthErrors = JSON.parse(healthErrorsRaw) as {
        message: string
        collection?: string
        timestamp: string
        type: string
      }[]
      healthErrors.push({
        message,
        ...(collection && { collection }),
        timestamp: new Date().toISOString(),
        type: 'firebase-error',
      })
      // Keep only last 10 errors
      const recentErrors = healthErrors.slice(-10)
      localStorage.setItem('app-health-errors', JSON.stringify(recentErrors))
    } catch {
      // If localStorage fails, just continue
    }
  }
}
