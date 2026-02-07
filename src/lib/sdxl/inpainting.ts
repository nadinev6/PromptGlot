import { getSDXLClient } from './client'
import type { InpaintRequest, InpaintResponse } from '../../types/image'
import { InpaintingError } from '../../types/errors'

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('base64')
}

export async function generateInpainting(
  request: InpaintRequest
): Promise<InpaintResponse> {
  try {
    const client = getSDXLClient()
    const imageBase64 = await fileToBase64(request.image)

    let maskBase64: string | undefined
    if (request.mask) {
      maskBase64 = await fileToBase64(request.mask)
    }

    if (request.action === 'REMOVE' && request.subject && !request.mask) {
      const result = await client.searchAndReplace({
        image: imageBase64,
        prompt: request.prompt,
        searchPrompt: request.subject,
        negativePrompt: request.subject,
        outputFormat: 'png',
      })

      return {
        success: true,
        imageBase64: result.base64,
        contentType: result.contentType,
        processedPrompt: request.prompt,
      }
    }

    const result = await client.inpaint({
      image: imageBase64,
      mask: maskBase64,
      prompt: request.prompt,
      negativePrompt: request.negativePrompt,
      strength: request.strength || 0.8,
      outputFormat: 'png',
    })

    return {
      success: true,
      imageBase64: result.base64,
      contentType: result.contentType,
      processedPrompt: request.prompt,
    }
  } catch (error) {
    if (error instanceof InpaintingError) {
      return {
        success: false,
        imageBase64: '',
        contentType: '',
        error: error.message,
      }
    }

    return {
      success: false,
      imageBase64: '',
      contentType: '',
      error: 'Failed to generate inpainted image',
    }
  }
}

export function validateInpaintRequest(request: InpaintRequest): boolean {
  if (!request.image) {
    throw new InpaintingError('Image is required', 'MISSING_IMAGE')
  }

  if (!request.prompt || request.prompt.trim().length === 0) {
    throw new InpaintingError('Prompt is required', 'MISSING_PROMPT')
  }

  if (request.strength !== undefined && (request.strength < 0 || request.strength > 1)) {
    throw new InpaintingError('Strength must be between 0 and 1', 'INVALID_STRENGTH')
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(request.image.type)) {
    throw new InpaintingError(
      `Invalid image type. Supported types: ${validTypes.join(', ')}`,
      'INVALID_IMAGE_TYPE'
    )
  }

  const maxSize = 10 * 1024 * 1024
  if (request.image.size > maxSize) {
    throw new InpaintingError(
      'Image size must be less than 10MB',
      'IMAGE_TOO_LARGE'
    )
  }

  return true
}
