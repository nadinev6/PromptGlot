// Lingo.dev SDK type definitions

export interface LingoTranslateOptions {
  sourceLocale: string
  targetLocale: string
  context?: string
  resolveDoubleNegation?: boolean
}

export interface LingoMetadata {
  action?: 'REMOVE' | 'ADD' | 'CHANGE'
  subject?: string
  resolveDoubleNegation?: boolean
  outputFormat?: string
}

export interface LingoTranslateResult {
  translatedText: string
  metadata?: LingoMetadata
}

export interface TranslationResult {
  original: string
  translated: string
  action?: 'REMOVE' | 'ADD' | 'CHANGE'
  subject?: string
  metadata: {
    hasDoubleNegation: boolean
    sourceLocale: string
    targetLocale: string
  }
}
