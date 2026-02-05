// SDXL inpainting logic

import { getSDXLClient } from './client'
import type { SDXLInpaintRequest, SDXLInpaintResponse } from './types'
import type { InpaintRequest, InpaintResponse } from '@/types/image'
import { InpaintingError } from '@/types/errors'

/**
 * Converts a File object to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix if present
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Generates an inpainted image using SDXL
 * 
 * @param request - Inpainting request with image, prompt, and options
 * @returns Inpainting response with generated image URL
 */
export async function generateInpainting(
  request: InpaintRequest
): Promise<InpaintResponse> {
  try {
    const client = getSDXLClient()

    // Convert image file to base64
    const imageBase64 = await fileToBase64(request.image)
    
    // Convert mask if provided
    let maskBase64: string | undefined
    if (request.mask) {
      maskBase64 = await fileToBase64(request.mask)
    }

    // Prepare SDXL request
    const sdxlRequest: SDXLInpaintRequest = {
      image: imageBase64,
      mask: maskBase64,
      prompt: request.prompt,
      strength: request.strength || 0.8,
      numInferenceSteps: 50,
      guidanceScale: 7.5,
    }

    // Call SDXL API
    const result = await client.inpaint(sdxlRequest)

    return {
      success: true,
      imageUrl: result.url,
      processedPrompt: request.prompt
    }
  } catch (error) {
    console.error('Inpainting error:', error)
    
    if (error instanceof InpaintingError) {
      return {
        success: false,
        imageUrl: '',
        error: error.message
      }
    }

    return {
      success: false,
      imageUrl: '',
      error: 'Failed to generate inpainted image'
    }
  }
}

/**
 * Validates an inpainting request
 * 
 * @param request - Request to validate
 * @returns True if valid, throws error otherwise
 */
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

  // Validate image file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(request.image.type)) {
    throw new InpaintingError(
      `Invalid image type. Supported types: ${validTypes.join(', ')}`,
      'INVALID_IMAGE_TYPE'
    )
  }

  // Validate image size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (request.image.size > maxSize) {
    throw new InpaintingError(
      'Image size must be less than 10MB',
      'IMAGE_TOO_LARGE'
    )
  }

  return true
}

/**
 * Generates a mask for inpainting based on object detection
 * This is a placeholder for future implementation
 * 
 * @param image - Source image
 * @param subject - Object to mask
 * @returns Mask image file
 */
export async function generateMask(
  image: File,
  subject: string
): Promise<File> {
  // TODO: Implement actual mask generation using object detection
  // For now, return a placeholder
  throw new InpaintingError(
    'Mask generation not yet implemented',
    'NOT_IMPLEMENTED'
  )
}
