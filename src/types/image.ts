// Image processing type definitions

export interface InpaintRequest {
  image: File
  prompt: string
  language: 'en' | 'af'
  mask?: File
  strength?: number
}

export interface InpaintResponse {
  success: boolean
  imageUrl: string
  processedPrompt?: string
  translatedPrompt?: string
  error?: string
}

export interface SDXLConfig {
  apiKey: string
  model: 'sdxl-inpainting-1.0'
  endpoint: string
}

export interface ImageGenerationOptions {
  width?: number
  height?: number
  numInferenceSteps?: number
  guidanceScale?: number
  seed?: number
}

export interface MaskGenerationOptions {
  threshold?: number
  blur?: number
}
