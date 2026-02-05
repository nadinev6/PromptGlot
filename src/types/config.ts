// Configuration type definitions

export interface LingoConfig {
  project: string
  lingoConfig: {
    source: string
    output: string
    format: 'i18next'
    languages: ['en', 'af']
    namespaces: string[]
    include: string
  }
  promptOps?: {
    source: string
    output: string
    languages: ['en', 'af']
    format: string
    versionControl: string
    note: string
  }
}

export interface I18nConfig {
  defaultLanguage: 'en'
  supportedLanguages: ['en', 'af']
  fallbackLanguage: 'en'
  provider?: {
    id: string
    model: string
    prompt: string
  }
  logic_rules?: Array<{
    pattern: string
    rule_id: string
    instruction: string
  }>
  buckets?: Array<{
    type: string
    include: string[]
    exclude: string[]
  }>
}

export interface AppConfig {
  lingo: LingoConfig
  i18n: I18nConfig
  sdxl?: {
    apiKey: string
    endpoint: string
  }
}
