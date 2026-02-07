import express from 'express'
import multer from 'multer'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { translateAfrikaansPrompt, batchTranslate } from './src/lib/lingo/translator'
import { generateInpainting, validateInpaintRequest } from './src/lib/sdxl/inpainting'
import { LingoTranslationError, InpaintingError } from './src/types/errors'
import { validateLanguageCode, sanitizeInput } from './src/lib/utils/validation'
import type { InpaintRequest } from './src/types/image'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

const app = express()
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

app.get('/api/health', (_req, res) => {
  const hasLingoKey = !!process.env.LINGODOTDEV_API_KEY
  const hasStabilityKey = !!process.env.STABILITY_API_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  const services = {
    lingo: { status: hasLingoKey ? 'configured' : 'missing_api_key', ready: hasLingoKey },
    stability: { status: hasStabilityKey ? 'configured' : 'missing_api_key', ready: hasStabilityKey },
    openai: { status: hasOpenAIKey ? 'configured' : 'missing_api_key', ready: hasOpenAIKey },
    api: { status: 'operational', ready: true },
  }

  const allReady = Object.values(services).every(s => s.ready)

  res.json({
    status: allReady ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  })
})

app.post('/api/translate', async (req, res) => {
  try {
    const { text, texts, sourceLocale = 'af', targetLocale = 'en-US' } = req.body

    if (!validateLanguageCode(sourceLocale, ['en', 'af'])) {
      res.status(400).json({
        success: false,
        error: `Invalid source language: ${sourceLocale}. Supported: en, af`,
      })
      return
    }

    if (text) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({ success: false, error: 'Text must be a non-empty string' })
        return
      }

      const sanitizedText = sanitizeInput(text)
      const result = await translateAfrikaansPrompt(sanitizedText)
      res.json({ success: true, translation: result })
      return
    }

    if (texts && Array.isArray(texts)) {
      if (texts.length === 0) {
        res.status(400).json({ success: false, error: 'Texts array cannot be empty' })
        return
      }
      if (texts.length > 50) {
        res.status(400).json({ success: false, error: 'Maximum 50 texts per batch request' })
        return
      }

      const sanitizedTexts = texts.map((t: unknown) => {
        if (typeof t !== 'string') throw new Error('All texts must be strings')
        return sanitizeInput(t)
      })

      const results = await batchTranslate(sanitizedTexts, sourceLocale, targetLocale)
      res.json({ success: true, translations: results })
      return
    }

    res.status(400).json({ success: false, error: 'Invalid request: provide text or texts' })
  } catch (error) {
    console.error('Translation error:', error)
    if (error instanceof LingoTranslationError) {
      res.status(500).json({ success: false, error: error.message, code: 'TRANSLATION_ERROR' })
      return
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
      code: 'INTERNAL_ERROR',
    })
  }
})

app.post(
  '/api/inpaint',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'mask', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      const imageFile = files['image']?.[0]
      const maskFile = files['mask']?.[0]

      if (!imageFile) {
        res.status(400).json({ success: false, error: 'Image is required' })
        return
      }

      const prompt = req.body.prompt as string | undefined
      const language = (req.body.language as string) || 'af'
      const strengthStr = req.body.strength as string | undefined
      const strength = strengthStr ? parseFloat(strengthStr) : undefined

      if (!prompt || prompt.trim().length === 0) {
        res.status(400).json({ success: false, error: 'Prompt is required' })
        return
      }

      if (!validateLanguageCode(language, ['en', 'af'])) {
        res.status(400).json({
          success: false,
          error: `Invalid language: ${language}. Supported: en, af`,
        })
        return
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

      const image = new File([imageFile.buffer], imageFile.originalname, {
        type: imageFile.mimetype,
      })
      let mask: File | undefined
      if (maskFile) {
        mask = new File([maskFile.buffer], maskFile.originalname, {
          type: maskFile.mimetype,
        })
      }

      const inpaintRequest: InpaintRequest = {
        image,
        prompt: processedPrompt,
        language: language as 'en' | 'af',
        mask,
        strength,
        negativePrompt,
        action,
        subject,
      }

      try {
        validateInpaintRequest(inpaintRequest)
      } catch (error) {
        if (error instanceof InpaintingError) {
          res.status(400).json({ success: false, error: error.message, code: error.code })
          return
        }
        throw error
      }

      const result = await generateInpainting(inpaintRequest)

      if (!result.success) {
        res.status(500).json({ success: false, error: result.error || 'Inpainting failed' })
        return
      }

      res.json({
        success: true,
        imageBase64: result.imageBase64,
        contentType: result.contentType,
        translatedPrompt: processedPrompt,
        originalPrompt,
        metadata: translationResult
          ? {
              action: translationResult.action,
              subject: translationResult.subject,
              hasDoubleNegation: translationResult.metadata.hasDoubleNegation,
            }
          : undefined,
      })
    } catch (error) {
      console.error('Inpainting error:', error)
      if (error instanceof InpaintingError) {
        res.status(500).json({ success: false, error: error.message, code: error.code })
        return
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Inpainting failed',
        code: 'INTERNAL_ERROR',
      })
    }
  }
)

if (isProd) {
  app.use(express.static(resolve(__dirname, 'dist')))
  app.get('*', (_req, res) => {
    res.sendFile(resolve(__dirname, 'dist', 'index.html'))
  })
} else {
  const { createServer } = await import('vite')
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })
  app.use(vite.middlewares)
}

const PORT = parseInt(process.env.PORT || '5173', 10)
app.listen(PORT, () => {
  console.log(`PromptGlot running at http://localhost:${PORT}`)
})
