import { NextRequest, NextResponse } from 'next/server'
import { translateAfrikaansPrompt } from '@/lib/lingo/translator'
import { generateInpainting, validateInpaintRequest } from '@/lib/sdxl/inpainting'
import { InpaintingError } from '@/types/errors'
import { validateLanguageCode, sanitizeInput } from '@/lib/utils/validation'
import type { InpaintRequest } from '@/types/image'

/**
 * POST /api/inpaint
 * Generates an inpainted image using SDXL
 * 
 * Request (multipart/form-data):
 * - image: File (required) - Source image
 * - prompt: string (required) - Editing prompt
 * - language: string (optional, default: 'af') - Prompt language
 * - mask: File (optional) - Mask image
 * - strength: number (optional, 0-1) - Inpainting strength
 * 
 * Response:
 * - success: boolean
 * - imageUrl: string - Generated image URL
 * - translatedPrompt: string - English prompt used
 * - originalPrompt: string - Original prompt
 * - error: string (if failed)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const image = formData.get('image') as File | null
    const prompt = formData.get('prompt') as string | null
    const language = (formData.get('language') as string) || 'af'
    const mask = formData.get('mask') as File | null
    const strengthStr = formData.get('strength') as string | null
    const strength = strengthStr ? parseFloat(strengthStr) : undefined

    // Validate required fields
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

    // Validate language
    if (!validateLanguageCode(language, ['en', 'af'])) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid language: ${language}. Supported: en, af` 
        },
        { status: 400 }
      )
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizeInput(prompt)
    const originalPrompt = sanitizedPrompt

    // Translate Afrikaans prompt to English if needed
    let processedPrompt = sanitizedPrompt
    let translationResult = null

    if (language === 'af') {
      try {
        translationResult = await translateAfrikaansPrompt(sanitizedPrompt)
        processedPrompt = translationResult.translated
        
        console.log('Translation:', {
          original: originalPrompt,
          translated: processedPrompt,
          action: translationResult.action,
          hasDoubleNegation: translationResult.metadata.hasDoubleNegation
        })
      } catch (error) {
        console.error('Translation failed, using original prompt:', error)
        // Continue with original prompt if translation fails
      }
    }

    // Create inpaint request
    const inpaintRequest: InpaintRequest = {
      image,
      prompt: processedPrompt,
      language: language as 'en' | 'af',
      mask: mask || undefined,
      strength
    }

    // Validate request
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

    // Generate inpainting
    const result = await generateInpainting(inpaintRequest)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Inpainting failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      translatedPrompt: processedPrompt,
      originalPrompt: originalPrompt,
      metadata: translationResult ? {
        action: translationResult.action,
        subject: translationResult.subject,
        hasDoubleNegation: translationResult.metadata.hasDoubleNegation
      } : undefined
    })

  } catch (error) {
    console.error('Inpainting error:', error)
    
    if (error instanceof InpaintingError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Inpainting failed',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inpaint
 * Returns API information
 */
export async function GET() {
  return NextResponse.json({
    name: 'Inpainting API',
    version: '1.0.0',
    description: 'SDXL-powered image inpainting with Afrikaans language support',
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
          strength: 'number - Inpainting strength 0-1 (optional, default: 0.8)'
        },
        supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      }
    },
    features: [
      'Afrikaans to English translation',
      'Double negation handling (nie...nie)',
      'Linguistic intent parsing (REMOVE/ADD/CHANGE)',
      'SDXL inpainting with 3-5 second processing time'
    ]
  })
}
