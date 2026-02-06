'use client'

import { useState, FormEvent } from 'react'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
  placeholder?: string
}

export function PromptInput({ 
  onSubmit, 
  disabled = false,
  placeholder = 'Enter command in any language...'
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-surface flex items-center px-6 rounded-[20px] h-16">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled}
          className="bg-transparent border-none text-[hsl(var(--foreground))] flex-1 text-base outline-none placeholder:text-[hsl(var(--foreground)/0.4)] disabled:opacity-50"
          placeholder={placeholder}
        />
        <button
          type="submit"
          disabled={disabled || !prompt.trim()}
          className="btn-pop bg-[hsl(var(--primary))] text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </button>
      </div>
    </form>
  )
}
