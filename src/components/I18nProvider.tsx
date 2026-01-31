'use client';

import { useEffect } from 'react';
import i18n from '../i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n on client side only
    i18n.init();
  }, []);

  return <>{children}</>;
}