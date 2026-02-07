import { useState, useEffect } from 'react'
import { Sun, Moon, Upload } from 'lucide-react'
import { inpaintImage, buildBase64DataUrl } from '@/lib/api/client'

interface AnalysisData {
  originalPrompt: string
  action?: string
  subject?: string
  hasDoubleNegation?: boolean
}

const ACTION_LABELS: Record<string, string> = {
  REMOVE: 'Object Removal',
  ADD: 'Object Addition',
  CHANGE: 'Object Modification',
}

export default function App() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2000'
  )
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [showOriginal, setShowOriginal] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('promptglot-theme')
    if (stored === 'dark') {
      setIsDark(true)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('promptglot-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string)
        setResult(null)
        setAnalysis(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image || !prompt.trim()) return

    setLoading(true)
    try {
      const response = await inpaintImage(image, prompt, { language: 'af' })
      setResult(buildBase64DataUrl(response.imageBase64, response.contentType))
      setAnalysis({
        originalPrompt: response.originalPrompt || prompt,
        action: response.metadata?.action,
        subject: response.metadata?.subject,
        hasDoubleNegation: response.metadata?.hasDoubleNegation,
      })
    } catch (error) {
      console.error('Inpainting failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <nav className="h-[72px] flex items-center justify-between px-4 md:px-10 border-b border-border">
        <div className="logo">PromptGlot</div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="btn-pop flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground-5 hover:bg-foreground-10 transition-colors text-sm cursor-pointer"
          >
            <Upload size={16} />
            {image ? 'Change' : 'Upload'}
          </label>
          <button className="btn-pop px-4 py-2 rounded-lg bg-foreground-5 hover:bg-foreground-10 transition-colors text-sm">
            History
          </button>
          <button className="btn-pop px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity text-sm font-semibold">
            Export
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-foreground-5 hover:bg-foreground-10 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main className="grid grid-cols-1 md:grid-cols-[1fr_320px] md:h-[calc(100vh-72px)] p-4 pb-32 md:p-10 md:pb-10 gap-6 md:gap-10">
        <section className="hero-canvas min-h-[300px] md:min-h-0" id="mainCanvas">
          <img
            src={showOriginal ? imagePreview : (result || imagePreview)}
            alt="Editor canvas"
            className="image-placeholder"
          />

          {result && (
            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <button
                onClick={() => setShowOriginal(true)}
                className={`btn-pop px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  showOriginal
                    ? 'bg-white text-black shadow-md'
                    : 'bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setShowOriginal(false)}
                className={`btn-pop px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  !showOriginal
                    ? 'bg-white text-black shadow-md'
                    : 'bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm'
                }`}
              >
                Edited
              </button>
            </div>
          )}

          {loading && (
            <div className="processing-overlay" style={{ display: 'flex' }}>
              <div className="loader-candy"></div>
              <p className="loader-text">Analysing Linguistic Logic...</p>
            </div>
          )}
        </section>

        <aside className="space-y-6 overflow-y-auto">
          {analysis ? (
            <>
              <div className="glass-surface rounded-2xl p-6">
                <h3 className="sidebar-title">Linguistic Analysis</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{'\u{1F1FF}\u{1F1E6}'}</span>
                  <span className="text-xs bg-primary text-white px-3 py-1 rounded-full font-semibold">
                    Afrikaans Detected
                  </span>
                </div>

                {analysis.action && (
                  <div className="logic-card">
                    <h4>Logic Resolution</h4>
                    <p>
                      {analysis.hasDoubleNegation && (
                        <span>Double Negative {'\u2192'} </span>
                      )}
                      <span className="text-accent font-bold">
                        {ACTION_LABELS[analysis.action] || analysis.action}
                      </span>
                    </p>
                  </div>
                )}

                {analysis.subject && (
                  <div className="logic-card">
                    <h4>Contextual Focus</h4>
                    <p>{analysis.subject}</p>
                  </div>
                )}
              </div>

              <div className="glass-surface rounded-2xl p-6">
                <h3 className="sidebar-title">Your Prompt</h3>
                <p className="text-sm leading-relaxed italic">
                  &ldquo;{analysis.originalPrompt}&rdquo;
                </p>
              </div>
            </>
          ) : (
            <div className="glass-surface rounded-2xl p-6">
              <p className="text-sm text-foreground-40 text-center">
                Submit a prompt to see analysis
              </p>
            </div>
          )}
        </aside>
      </main>

      <div className="command-centre-wrapper">
        <form onSubmit={handleSubmit} className="command-bar glass-surface">
          <svg className="sparkle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
          </svg>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="command-input"
            placeholder="Verwyder die vrugte op die tafel..."
            id="promptInput"
          />
          <kbd className="shortcut-hint">{'\u2318'} + {'\u21B5'}</kbd>
        </form>
      </div>
    </div>
  )
}
