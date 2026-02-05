// Afrikaans translation logic using Lingo.dev SDK

import { getLingoClient } from './client'
import type { TranslationResult } from './types'

/**
 * Translates Afrikaans text to English using Lingo.dev SDK
 * Handles special Afrikaans linguistic patterns like double negation ("nie...nie")
 * 
 * @param afrikaansText - The Afrikaans text to translate
 * @returns Translation result with metadata
 */
export async function translateAfrikaansPrompt(
  afrikaansText: string
): Promise<TranslationResult> {
  const client = getLingoClient()
  
  // Use Lingo.dev SDK to translate Afrikaans to English
  // The SDK will handle double negation resolution through metadata
  const result = await client.translateWithIntent(afrikaansText, {
    sourceLocale: 'af',
    targetLocale: 'en-US',
    context: 'sdxl-image-editing-prompt',
    resolveDoubleNegation: true
  })

  // Detect double negation pattern
  const hasDoubleNegation = afrikaansText.includes('nie') && 
                           afrikaansText.lastIndexOf('nie') !== afrikaansText.indexOf('nie')

  return {
    original: afrikaansText,
    translated: result.translatedText,
    action: result.metadata?.action,
    subject: result.metadata?.subject,
    metadata: {
      hasDoubleNegation,
      sourceLocale: 'af',
      targetLocale: 'en-US'
    }
  }
}

/**
 * Batch translate multiple Afrikaans texts to English
 * Useful for processing multiple prompts efficiently
 * 
 * @param texts - Array of Afrikaans texts to translate
 * @param sourceLocale - Source language code (default: 'af')
 * @param targetLocale - Target language code (default: 'en-US')
 * @returns Array of translation results
 */
export async function batchTranslate(
  texts: string[],
  sourceLocale: string = 'af',
  targetLocale: string = 'en-US'
): Promise<TranslationResult[]> {
  const client = getLingoClient()
  
  // Use Lingo.dev SDK batch translation for efficiency
  const results = await Promise.all(
    texts.map(text => 
      client.translateWithIntent(text, {
        sourceLocale,
        targetLocale,
        resolveDoubleNegation: true
      })
    )
  )

  return results.map((result, index) => ({
    original: texts[index],
    translated: result.translatedText,
    action: result.metadata?.action,
    subject: result.metadata?.subject,
    metadata: {
      hasDoubleNegation: texts[index].includes('nie'),
      sourceLocale,
      targetLocale
    }
  }))
}

/**
 * Detects if Afrikaans text contains double negation pattern
 * Afrikaans uses "nie...nie" structure for negation
 * 
 * @param text - Afrikaans text to analyze
 * @returns True if double negation is detected
 */
export function detectDoubleNegation(text: string): boolean {
  const nieCount = (text.match(/\bnie\b/gi) || []).length
  return nieCount >= 2
}

/**
 * Parses linguistic intent from Afrikaans text
 * Determines if the user wants to ADD, REMOVE, or CHANGE something
 * 
 * @param afrikaansText - The Afrikaans text to parse
 * @returns Parsed intent with action and subject
 */
export async function parseLinguisticIntent(
  afrikaansText: string
): Promise<{
  action: 'REMOVE' | 'ADD' | 'CHANGE' | undefined
  subject: string | undefined
  englishPrompt: string
}> {
  const translation = await translateAfrikaansPrompt(afrikaansText)
  
  return {
    action: translation.action,
    subject: translation.subject,
    englishPrompt: translation.translated
  }
}
