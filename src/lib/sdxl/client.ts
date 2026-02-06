import type { SDXLClientConfig, SDXLInpaintRequest, SDXLInpaintResponse, SDXLSearchReplaceRequest } from './types'
import { InpaintingError } from '@/types/errors'

const STABILITY_API_BASE = 'https://api.stability.ai/v2beta/stable-image'

export class SDXLClient {
  private config: SDXLClientConfig

  constructor(config: SDXLClientConfig) {
    this.config = config
  }

  async inpaint(request: SDXLInpaintRequest): Promise<SDXLInpaintResponse> {
    const formData = new FormData()

    if (typeof request.image === 'string') {
      const imageBuffer = Buffer.from(request.image, 'base64')
      formData.append('image', new Blob([imageBuffer]), 'image.png')
    } else {
      formData.append('image', request.image)
    }

    if (request.mask) {
      if (typeof request.mask === 'string') {
        const maskBuffer = Buffer.from(request.mask, 'base64')
        formData.append('mask', new Blob([maskBuffer]), 'mask.png')
      } else {
        formData.append('mask', request.mask)
      }
    }

    formData.append('prompt', request.prompt)

    if (request.negativePrompt) {
      formData.append('negative_prompt', request.negativePrompt)
    }
    if (request.strength !== undefined) {
      formData.append('strength', request.strength.toString())
    }
    if (request.seed !== undefined) {
      formData.append('seed', request.seed.toString())
    }
    formData.append('output_format', request.outputFormat || 'png')

    return this.request(`${STABILITY_API_BASE}/edit/inpaint`, formData)
  }

  async searchAndReplace(request: SDXLSearchReplaceRequest): Promise<SDXLInpaintResponse> {
    const formData = new FormData()

    if (typeof request.image === 'string') {
      const imageBuffer = Buffer.from(request.image, 'base64')
      formData.append('image', new Blob([imageBuffer]), 'image.png')
    } else {
      formData.append('image', request.image)
    }

    formData.append('prompt', request.prompt)
    formData.append('search_prompt', request.searchPrompt)

    if (request.negativePrompt) {
      formData.append('negative_prompt', request.negativePrompt)
    }
    if (request.seed !== undefined) {
      formData.append('seed', request.seed.toString())
    }
    formData.append('output_format', request.outputFormat || 'png')

    return this.request(`${STABILITY_API_BASE}/edit/search-and-replace`, formData)
  }

  private async request(url: string, formData: FormData): Promise<SDXLInpaintResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeout || 60000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json',
        },
        body: formData,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorBody = await response.text()
        let errorMessage: string
        try {
          const parsed = JSON.parse(errorBody)
          errorMessage = parsed.message || parsed.errors?.[0] || errorBody
        } catch {
          errorMessage = errorBody
        }
        throw new InpaintingError(
          `Stability AI API error (${response.status}): ${errorMessage}`,
          'STABILITY_API_ERROR',
          { statusCode: response.status }
        )
      }

      const data = await response.json()

      return {
        base64: data.image,
        contentType: `image/${data.output_format || 'png'}`,
        seed: data.seed,
        finishReason: data.finish_reason,
      }
    } catch (error) {
      if (error instanceof InpaintingError) throw error
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new InpaintingError('Request timed out', 'TIMEOUT')
      }
      throw new InpaintingError(
        error instanceof Error ? error.message : 'Stability AI request failed',
        'NETWORK_ERROR'
      )
    } finally {
      clearTimeout(timeout)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('https://api.stability.ai/v1/user/account', {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

let sdxlClient: SDXLClient | null = null

export function getSDXLClient(): SDXLClient {
  if (!sdxlClient) {
    const apiKey = process.env.STABILITY_API_KEY
    if (!apiKey) {
      throw new InpaintingError(
        'STABILITY_API_KEY environment variable is required',
        'MISSING_API_KEY'
      )
    }

    sdxlClient = new SDXLClient({
      apiKey,
      timeout: 60000,
    })
  }
  return sdxlClient
}

export function resetSDXLClient(): void {
  sdxlClient = null
}
