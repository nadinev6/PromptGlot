// Error type definitions

export class LingoTranslationError extends Error {
  constructor(
    message: string,
    public readonly input: string,
    public readonly sourceLocale?: string,
    public readonly targetLocale?: string
  ) {
    super(message)
    this.name = 'LingoTranslationError'
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LingoTranslationError)
    }
  }
}

export class InpaintingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'InpaintingError'
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InpaintingError)
    }
  }
}

export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly configKey: string
  ) {
    super(message)
    this.name = 'ConfigurationError'
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigurationError)
    }
  }
}

export interface APIError {
  success: false
  error: string
  code?: string
  details?: unknown
}

export interface APISuccess<T = unknown> {
  success: true
  data: T
}

export type APIResponse<T = unknown> = APISuccess<T> | APIError

// Type guard for API errors
export function isAPIError(response: APIResponse): response is APIError {
  return response.success === false
}

// Type guard for API success
export function isAPISuccess<T>(response: APIResponse<T>): response is APISuccess<T> {
  return response.success === true
}
