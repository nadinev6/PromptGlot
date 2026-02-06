import { LingoDotDevEngine } from 'lingo.dev/sdk'
import OpenAI from 'openai'
import type { LingoTranslateOptions, LingoTranslateResult } from './types'

export class LingoClient {
  private engine: LingoDotDevEngine
  private openai: OpenAI

  constructor(lingoApiKey: string, openaiApiKey: string) {
    this.engine = new LingoDotDevEngine({ apiKey: lingoApiKey })
    this.openai = new OpenAI({ apiKey: openaiApiKey })
  }

  async translateWithIntent(
    text: string,
    options: LingoTranslateOptions
  ): Promise<LingoTranslateResult> {
    const translatedText = await this.engine.localizeText(text, {
      sourceLocale: options.sourceLocale,
      targetLocale: options.targetLocale,
    })

    const intentResult = await this.parseIntent(text, translatedText)

    return {
      translatedText: intentResult.refinedPrompt || translatedText,
      metadata: {
        action: intentResult.action,
        subject: intentResult.subject,
        resolveDoubleNegation: options.resolveDoubleNegation,
        outputFormat: 'json',
      },
    }
  }

  private async parseIntent(
    originalAfrikaans: string,
    englishTranslation: string
  ): Promise<{
    action?: 'REMOVE' | 'ADD' | 'CHANGE'
    subject?: string
    refinedPrompt?: string
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a visual intent parser for PromptGlot. Your job is to analyze Afrikaans commands and their English translations to determine image-editing intent. SPECIAL RULE: Afrikaans uses double negation (e.g., 'nie...nie'). If you see this pattern, the user wants to REMOVE the object mentioned. Output JSON: { "action": "REMOVE"|"ADD"|"CHANGE", "subject": "item_name", "refined_prompt": "English description of desired final image state" }`,
          },
          {
            role: 'user',
            content: `Afrikaans: "${originalAfrikaans}"\nEnglish translation: "${englishTranslation}"\n\nParse the visual editing intent.`,
          },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) return {}

      const parsed = JSON.parse(content)
      return {
        action: parsed.action,
        subject: parsed.subject,
        refinedPrompt: parsed.refined_prompt,
      }
    } catch {
      return {}
    }
  }
}

let lingoClient: LingoClient | null = null

export function getLingoClient(): LingoClient {
  if (!lingoClient) {
    const lingoKey = process.env.LINGODOTDEV_API_KEY
    if (!lingoKey) {
      throw new Error('LINGODOTDEV_API_KEY environment variable is required')
    }
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    lingoClient = new LingoClient(lingoKey, openaiKey)
  }
  return lingoClient
}

export function resetLingoClient(): void {
  lingoClient = null
}
