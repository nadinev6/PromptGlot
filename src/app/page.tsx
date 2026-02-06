'use client'

import { useState } from 'react'
import { inpaintImage, buildBase64DataUrl } from '@/lib/api/client'

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2000')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [showOriginal, setShowOriginal] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        setResult(null)
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
    } catch (error) {
      console.error('Inpainting failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <nav className="h-[72px] flex items-center justify-between px-10 border-b border-[hsl(var(--border))]">
        <div className="logo">PromptGlot</div>
        <div className="flex gap-4">
          <button className="btn-pop px-4 py-2 rounded-lg bg-[hsl(var(--foreground)/0.05)] hover:bg-[hsl(var(--foreground)/0.1)] transition-colors text-sm">History</button>
          <button className="btn-pop px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity text-sm font-semibold">Export</button>
        </div>
      </nav>

      <main className="grid grid-cols-[1fr_320px] h-[calc(100vh-72px)] p-10 gap-10">
        <section className="hero-canvas" id="mainCanvas">
          <img
            src={showOriginal ? imagePreview : (result || imagePreview)}
            alt="Kitchen Scene"
            className="image-placeholder"
            id="displayImage"
          />

          <div className="absolute top-6 right-6 flex gap-2 z-10">
            <button
              onClick={() => setShowOriginal(true)}
              className={`btn-pop px-4 py-2 rounded-lg transition-all text-sm font-medium ${showOriginal ? 'bg-white text-black shadow-md' : 'bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm'}`}
              id="btnOriginal"
            >
              Original
            </button>
            <button
              onClick={() => setShowOriginal(false)}
              className={`btn-pop px-4 py-2 rounded-lg transition-all text-sm font-medium ${!showOriginal ? 'bg-white text-black shadow-md' : 'bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm'}`}
              id="btnEdited"
            >
              Edited
            </button>
          </div>

          {loading && (
            <div className="processing-overlay" style={{ display: 'flex' }}>
              <div className="loader-candy"></div>
              <p className="loader-text">Analysing Linguistic Logic...</p>
            </div>
          )}
        </section>

        <aside className="space-y-6 overflow-y-auto">
          <div className="glass-surface rounded-2xl p-6">
            <h3 className="sidebar-title">Linguistic Analysis</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇿🇦</span>
              <span className="text-xs bg-[hsl(var(--primary))] text-white px-3 py-1 rounded-full font-semibold">Afrikaans Detected</span>
            </div>

            <div className="logic-card">
              <h4>Logic Resolution</h4>
              <p>Double Negative → <span className="text-[hsl(var(--accent))] font-bold">Object Removal</span></p>
            </div>

            <div className="logic-card">
              <h4>Contextual Focus</h4>
              <p>Fruit bowl (Central)</p>
            </div>
          </div>

          <div className="glass-surface rounded-2xl p-6">
            <h3 className="sidebar-title">Confidence Score</h3>
            <div className="progress-wrapper">
              <svg className="radial-progress" viewBox="0 0 100 100">
                <circle className="radial-bg" cx="50" cy="50" r="40"></circle>
                <circle className="radial-fill" cx="50" cy="50" r="40" style={{ strokeDashoffset: 25 }}></circle>
              </svg>
              <div className="confidence-label">94%</div>
            </div>
          </div>

          <div className="glass-surface rounded-2xl p-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="btn-pop block w-full px-4 py-3 text-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] cursor-pointer hover:opacity-90 transition-opacity font-semibold text-sm"
            >
              Upload Image
            </label>
          </div>
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
          <kbd className="shortcut-hint">⌘ + ↵</kbd>
        </form>
      </div>
    </div>
  )
}
