import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Health check endpoint
 * 
 * Returns:
 * - status: string - 'healthy' or 'unhealthy'
 * - timestamp: string - ISO timestamp
 * - services: object - Status of each service
 */
export async function GET() {
  const timestamp = new Date().toISOString()
  
  // Check environment variables
  const hasLingoKey = !!process.env.LINGODOTDEV_API_KEY
  const hasSDXLKey = !!(process.env.SDXL_API_KEY || process.env.OPENAI_API_KEY)
  
  const services = {
    lingo: {
      status: hasLingoKey ? 'configured' : 'missing_api_key',
      ready: hasLingoKey
    },
    sdxl: {
      status: hasSDXLKey ? 'configured' : 'missing_api_key',
      ready: hasSDXLKey
    },
    api: {
      status: 'operational',
      ready: true
    }
  }

  const allReady = Object.values(services).every(s => s.ready)
  
  return NextResponse.json({
    status: allReady ? 'healthy' : 'degraded',
    timestamp,
    services,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
}
