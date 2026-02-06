export interface SDXLInpaintRequest {
  image: string | File
  mask?: string | File
  prompt: string
  negativePrompt?: string
  strength?: number
  seed?: number
  outputFormat?: 'png' | 'jpeg' | 'webp'
}

export interface SDXLInpaintResponse {
  base64: string
  contentType: string
  seed?: number
  finishReason?: string
}

export interface SDXLSearchReplaceRequest {
  image: string | File
  prompt: string
  searchPrompt: string
  negativePrompt?: string
  seed?: number
  outputFormat?: 'png' | 'jpeg' | 'webp'
}

export interface SDXLClientConfig {
  apiKey: string
  endpoint?: string
  timeout?: number
}

export interface SDXLError {
  message: string
  code: string
  statusCode?: number
}
