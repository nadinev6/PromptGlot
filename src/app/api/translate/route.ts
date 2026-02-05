import { NextRequest, NextResponse } from 'next/server'
import { translateAfrikaansPrompt, batchTranslate } from '@/lib/lingo/translator'
import { LingoTranslationError } from '@/types/errors'
import { validateLanguageCode, sanitizeInput } from '@/lib/utils/validation'

/**
 * POST /api/translate
 * Translates Afrikaans text to English using Lingo.dev SDK
 * 
 * Request body:
 * - text: string (for single translation)
 * - texts: string[] (for batch translation)
 * - sourceLocale: string (optional, default: 'af')
 * - targetLocale: string (optional, default: 'en-US')
 * 
 * Response:
 * - success: boolean
 * - translation: TranslationResult (for single)
 * - translations: TranslationResult[] (for batch)
 * - error: string (if failed)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, texts, sourceLocale = 'af', targetLocale = 'en-US' } = body
    
    // Validate language codes
    if (!validateLanguageCode(sourceLocale, ['en', 'af'])) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid source language: ${sourceLocale}. Supported: en, af` 
        },
        { status: 400 }
      )
    }

    // Handle single translation
    if (text) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Text must be a non-empty string' },
          { status: 400 }
        )
      }

      const sanitizedText = sanitizeInput(text)
      const result = await translateAfrikaansPrompt(sanitizedText)
      
      return NextResponse.json({
        success: true,
        translation: result
      })
    }
    
    // Handle batch translation
    if (texts && Array.isArray(texts)) {
      if (texts.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Texts array cannot be empty' },
          { status: 400 }
        )
      }

      if (texts.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Maximum 50 texts per batch request' },
          { status: 400 }
        )
      }

      // Validate and sanitize all texts
      const sanitizedTexts = texts.map(t => {
        if (typeof t !== 'string') {
          throw new Error('All texts must be strings')
        }
        return sanitizeInput(t)
      })

      const results = await batchTranslate(sanitizedTexts, sourceLocale, targetLocale)
      
      return NextResponse.json({
        success: true,
        translations: results
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request: provide text or texts' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Translation error:', error)
    
    if (error instanceof LingoTranslationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: 'TRANSLATION_ERROR'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Translation failed',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/translate
 * Returns API information
 */
export async function GET() {
  return NextResponse.json({
    name: 'Translation API',
    version: '1.0.0',
    description: 'Translates Afrikaans text to English using Lingo.dev SDK',
    supportedLanguages: ['en', 'af'],
    endpoints: {
      POST: {
        description: 'Translate text',
        parameters: {
          text: 'string - Single text to translate',
          texts: 'string[] - Multiple texts to translate (max 50)',
          sourceLocale: 'string - Source language (default: af)',
          targetLocale: 'string - Target language (default: en-US)'
        }
      }
    }
  })
}
