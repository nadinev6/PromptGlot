// Validation utilities

import { ConfigurationError } from '@/types/errors'

/**
 * Validates that required environment variables are set
 * 
 * @param variables - Array of environment variable names to check
 * @throws ConfigurationError if any variable is missing
 */
export function validateEnvironmentVariables(variables: string[]): void {
  const missing: string[] = []

  for (const variable of variables) {
    if (!process.env[variable]) {
      missing.push(variable)
    }
  }

  if (missing.length > 0) {
    throw new ConfigurationError(
      `Missing required environment variables: ${missing.join(', ')}`,
      missing[0]
    )
  }
}

/**
 * Validates a language code
 * 
 * @param lang - Language code to validate
 * @param supportedLanguages - Array of supported language codes
 * @returns True if valid
 */
export function validateLanguageCode(
  lang: string,
  supportedLanguages: string[] = ['en', 'af']
): boolean {
  return supportedLanguages.includes(lang)
}

/**
 * Sanitizes user input to prevent injection attacks
 * 
 * @param input - User input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
}

/**
 * Validates a file size
 * 
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if valid
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Validates a file type
 * 
 * @param type - MIME type of the file
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if valid
 */
export function validateFileType(type: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(type)
}

/**
 * Formats file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
