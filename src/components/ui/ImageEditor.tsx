'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { inpaintImage } from '@/lib/api/client'
import { PromptInput } from './PromptInput'

interface ImageEditorProps {
  className?: string
}

export function ImageEditor({ className = '' }: ImageEditorProps) {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [translationInfo, setTranslationInfo] = useState<{
    original: string
    translated: string
    action?: string
    subject?: string
  } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInpaint = async (prompt: string) => {
    if (!image) {
      setError('Please select an image first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await inpaintImage(image, prompt, {
        language: 'af',
        strength: 0.8
      })
      
      setResult(response.imageUrl)
      setTranslationInfo({
        original: response.originalPrompt || prompt,
        translated: response.translatedPrompt || prompt,
        action: response.metadata?.action,
        subject: response.metadata?.subject
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inpainting failed')
      console.error('Inpainting error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Image Upload Section */}
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-pop bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-6 py-3 rounded-lg font-semibold"
        >
          {image ? 'Change Image' : 'Upload Image'}
        </button>
      </div>

      {/* Image Display */}
      {imagePreview && (
        <div className="relative rounded-[32px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
          <img
            src={result || imagePreview}
            alt="Editor Canvas"
            className="w-full h-auto object-cover rounded-[32px]"
          />
          
          {/* Loading overlay with loader-candy */}
          {loading && (
            <div className="processing-overlay">
              <div className="loader-candy"></div>
              <p className="loader-text">Analysing Linguistic Logic...</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-700 dark:text-red-200">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Translation Info */}
      {translationInfo && (
        <div className="glass-surface rounded-lg p-4 space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-[hsl(var(--foreground)/0.45)]">Translation</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-[hsl(var(--foreground)/0.45)]">Original:</span> {translationInfo.original}</p>
            <p><span className="text-[hsl(var(--foreground)/0.45)]">English:</span> {translationInfo.translated}</p>
            {translationInfo.action && (
              <p><span className="text-[hsl(var(--foreground)/0.45)]">Action:</span> {translationInfo.action}</p>
            )}
            {translationInfo.subject && (
              <p><span className="text-[hsl(var(--foreground)/0.45)]">Subject:</span> {translationInfo.subject}</p>
            )}
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[680px] px-4">
        <PromptInput
          onSubmit={handleInpaint}
          disabled={loading || !image}
          placeholder={image ? 'Enter Afrikaans command...' : 'Upload an image first...'}
        />
      </div>
    </div>
  )
}
