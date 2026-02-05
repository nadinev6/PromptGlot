'use client'

import { useEffect } from 'react'
import i18n from '@/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n on client side only
    if (!i18n.isInitialized) {
      i18n.init()
    }
  }, [])

  return <>{children}</>
}
