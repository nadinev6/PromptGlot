// Client-side API utilities for calling backend routes

import type { TranslationResult } from '@/lib/lingo/types'
import type { InpaintResponse } from '@/types/image'

/**
 * Translates Afrikaans text to English
 * 
 * @param text - Text to translate
 * @param sourceLocale - Source language (default: 'af')
 * @param targetLocale - Target language (default: 'en-US')
 * @returns Translation result
 */
export async function translateText(
  text: string,
  sourceLocale: string = 'af',
  targetLocale: string = 'en-US'
): Promise<TranslationResult> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, sourceLocale, targetLocale }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Translation failed')
  }

  return data.translation
}

/**
 * Batch translates multiple texts
 * 
 * @param texts - Array of texts to translate
 * @param sourceLocale - Source language (default: 'af')
 * @param targetLocale - Target language (default: 'en-US')
 * @returns Array of translation results
 */
export async function batchTranslateTexts(
  texts: string[],
  sourceLocale: string = 'af',
  targetLocale: string = 'en-US'
): Promise<TranslationResult[]> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texts, sourceLocale, targetLocale }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Batch translation failed')
  }

  return data.translations
}

/**
 * Generates an inpainted image
 * 
 * @param image - Source image file
 * @param prompt - Editing prompt
 * @param options - Additional options
 * @returns Inpainting result with image URL
 */
export async function inpaintImage(
  image: File,
  prompt: string,
  options?: {
    language?: 'en' | 'af'
    mask?: File
    strength?: number
  }
): Promise<InpaintResponse & { 
  translatedPrompt?: string
  originalPrompt?: string
  metadata?: {
    action?: string
    subject?: string
    hasDoubleNegation?: boolean
  }
}> {
  const formData = new FormData()
  formData.append('image', image)
  formData.append('prompt', prompt)
  
  if (options?.language) {
    formData.append('language', options.language)
  }
  
  if (options?.mask) {
    formData.append('mask', options.mask)
  }
  
  if (options?.strength !== undefined) {
    formData.append('strength', options.strength.toString())
  }

  const response = await fetch('/api/inpaint', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Inpainting failed')
  }

  return data
}

/**
 * Checks API health status
 * 
 * @returns Health status
 */
export async function checkHealth(): Promise<{
  status: string
  timestamp: string
  services: Record<string, { status: string; ready: boolean }>
  version: string
  environment: string
}> {
  const response = await fetch('/api/health')
  return response.json()
}
