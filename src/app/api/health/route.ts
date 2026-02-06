import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = new Date().toISOString()

  const hasLingoKey = !!process.env.LINGODOTDEV_API_KEY
  const hasStabilityKey = !!process.env.STABILITY_API_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  const services = {
    lingo: {
      status: hasLingoKey ? 'configured' : 'missing_api_key',
      ready: hasLingoKey,
    },
    stability: {
      status: hasStabilityKey ? 'configured' : 'missing_api_key',
      ready: hasStabilityKey,
    },
    openai: {
      status: hasOpenAIKey ? 'configured' : 'missing_api_key',
      ready: hasOpenAIKey,
    },
    api: {
      status: 'operational',
      ready: true,
    },
  }

  const allReady = Object.values(services).every(s => s.ready)

  return NextResponse.json({
    status: allReady ? 'healthy' : 'degraded',
    timestamp,
    services,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  })
}
