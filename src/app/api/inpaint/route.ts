import { NextRequest, NextResponse } from 'next/server'
import { translateAfrikaansPrompt } from '@/lib/lingo/translator'
import { generateInpainting, validateInpaintRequest } from '@/lib/sdxl/inpainting'
import { InpaintingError } from '@/types/errors'
import { validateLanguageCode, sanitizeInput } from '@/lib/utils/validation'
import type { InpaintRequest } from '@/types/image'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const image = formData.get('image') as File | null
    const prompt = formData.get('prompt') as string | null
    const language = (formData.get('language') as string) || 'af'
    const mask = formData.get('mask') as File | null
    const strengthStr = formData.get('strength') as string | null
    const strength = strengthStr ? parseFloat(strengthStr) : undefined

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      )
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!validateLanguageCode(language, ['en', 'af'])) {
      return NextResponse.json(
        { success: false, error: `Invalid language: ${language}. Supported: en, af` },
        { status: 400 }
      )
    }

    const sanitizedPrompt = sanitizeInput(prompt)
    const originalPrompt = sanitizedPrompt

    let processedPrompt = sanitizedPrompt
    let translationResult = null
    let negativePrompt: string | undefined
    let action: 'REMOVE' | 'ADD' | 'CHANGE' | undefined
    let subject: string | undefined

    if (language === 'af') {
      try {
        translationResult = await translateAfrikaansPrompt(sanitizedPrompt)
        processedPrompt = translationResult.translated
        action = translationResult.action
        subject = translationResult.subject

        if (action === 'REMOVE' && subject) {
          negativePrompt = subject
        }
      } catch (error) {
        console.error('Translation failed, using original prompt:', error)
      }
    }

    const inpaintRequest: InpaintRequest = {
      image,
      prompt: processedPrompt,
      language: language as 'en' | 'af',
      mask: mask || undefined,
      strength,
      negativePrompt,
      action,
      subject,
    }

    try {
      validateInpaintRequest(inpaintRequest)
    } catch (error) {
      if (error instanceof InpaintingError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: 400 }
        )
      }
      throw error
    }

    const result = await generateInpainting(inpaintRequest)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Inpainting failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageBase64: result.imageBase64,
      contentType: result.contentType,
      translatedPrompt: processedPrompt,
      originalPrompt,
      metadata: translationResult ? {
        action: translationResult.action,
        subject: translationResult.subject,
        hasDoubleNegation: translationResult.metadata.hasDoubleNegation,
      } : undefined,
    })
  } catch (error) {
    console.error('Inpainting error:', error)

    if (error instanceof InpaintingError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Inpainting failed',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Inpainting API',
    version: '1.0.0',
    description: 'Stability AI-powered image inpainting with Afrikaans language support via Lingo.dev',
    supportedLanguages: ['en', 'af'],
    endpoints: {
      POST: {
        description: 'Generate inpainted image',
        contentType: 'multipart/form-data',
        parameters: {
          image: 'File - Source image (required, max 10MB)',
          prompt: 'string - Editing prompt (required)',
          language: 'string - Prompt language (optional, default: af)',
          mask: 'File - Mask image (optional)',
          strength: 'number - Inpainting strength 0-1 (optional, default: 0.8)',
        },
        supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      },
    },
    features: [
      'Afrikaans to English translation via Lingo.dev SDK',
      'Double negation handling (nie...nie) with GPT-4o intent parsing',
      'Linguistic intent parsing (REMOVE/ADD/CHANGE)',
      'Stability AI SDXL inpainting',
      'Search-and-replace for maskless object removal',
      'Negative prompt injection for REMOVE actions',
      'Base64 image response',
    ],
  })
}
