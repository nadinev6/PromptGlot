export interface InpaintRequest {
  image: File
  prompt: string
  language: 'en' | 'af'
  mask?: File
  strength?: number
  negativePrompt?: string
  action?: 'REMOVE' | 'ADD' | 'CHANGE'
  subject?: string
}

export interface InpaintResponse {
  success: boolean
  imageBase64: string
  contentType: string
  processedPrompt?: string
  error?: string
}
