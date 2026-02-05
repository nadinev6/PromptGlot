'use client'

import { useState, useEffect } from 'react'

export function Navigation() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <nav className="h-18 flex items-center justify-between px-10 border-b border-[var(--glass-border)]">
      <div className="logo-container">
        <div className="text-xl font-extrabold uppercase bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          PromptGlot
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="theme-switch-wrapper">
          <span className="toggle-label">Light</span>
          <label className="switch" htmlFor="themeToggle">
            <input
              type="checkbox"
              id="themeToggle"
              checked={isDark}
              onChange={(e) => setIsDark(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
          <span className="toggle-label">Dark</span>
        </div>
        
        <button className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
          History
        </button>
        
        <button className="px-4 py-2 rounded-lg btn-pop bg-[hsl(var(--primary))] text-white">
          Export
        </button>
      </div>
    </nav>
  )
}
