'use client'

interface LinguisticAnalysisProps {
  analysis?: {
    pattern: string
    intent: string
    target?: string
    confidence?: number
  }
  className?: string
}

export function LinguisticAnalysis({ analysis, className = '' }: LinguisticAnalysisProps) {
  const defaultAnalysis = {
    pattern: 'Negative Concord (nie...nie)',
    intent: 'OBJECT_REMOVAL',
    target: 'Fruit Bowl',
    confidence: 94
  }

  const data = analysis || defaultAnalysis

  return (
    <aside className={`lingo-sidebar ${className}`}>
      <div className="mb-6">
        <h3 className="sidebar-title">
          Linguistic Analysis
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm">Afrikaans Pattern Resolved</span>
          </div>
          
          <div className="space-y-4">
            <div className="logic-step">
              <span className="text-xs text-foreground-45 uppercase">Syntax Detected</span>
              <p className="mt-1 font-mono text-sm">{data.pattern}</p>
            </div>
            <div className="logic-step">
              <span className="text-xs text-foreground-45 uppercase">Resolved Intent</span>
              <p className="mt-1 font-mono text-sm">{data.intent}</p>
            </div>
          </div>

          {data.target && (
            <div className="flex items-center gap-2 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <span>Target: <strong>{data.target}</strong></span>
            </div>
          )}
        </div>
      </div>

      {data.confidence && (
        <div>
          <h3 className="sidebar-title">
            AI Confidence
          </h3>
          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold">{data.confidence}%</div>
          </div>
        </div>
      )}
    </aside>
  )
}
