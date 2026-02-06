import type { TranslationResult } from '@/lib/lingo/types'

export async function translateText(
  text: string,
  sourceLocale: string = 'af',
  targetLocale: string = 'en-US'
): Promise<TranslationResult> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLocale, targetLocale }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Translation failed')
  }

  return data.translation
}

export async function batchTranslateTexts(
  texts: string[],
  sourceLocale: string = 'af',
  targetLocale: string = 'en-US'
): Promise<TranslationResult[]> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, sourceLocale, targetLocale }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Batch translation failed')
  }

  return data.translations
}

export interface InpaintResult {
  success: boolean
  imageBase64: string
  contentType: string
  translatedPrompt?: string
  originalPrompt?: string
  metadata?: {
    action?: string
    subject?: string
    hasDoubleNegation?: boolean
  }
}

export async function inpaintImage(
  image: File,
  prompt: string,
  options?: {
    language?: 'en' | 'af'
    mask?: File
    strength?: number
  }
): Promise<InpaintResult> {
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

export function buildBase64DataUrl(base64: string, contentType: string): string {
  return `data:${contentType};base64,${base64}`
}

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
