// SDXL-specific type definitions

export interface SDXLInpaintRequest {
  image: string | File // Base64 or File
  mask?: string | File // Base64 or File
  prompt: string
  negativePrompt?: string
  strength?: number // 0.0 to 1.0
  numInferenceSteps?: number
  guidanceScale?: number
  seed?: number
}

export interface SDXLInpaintResponse {
  url: string
  seed?: number
  timings?: {
    inference: number
    total: number
  }
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
