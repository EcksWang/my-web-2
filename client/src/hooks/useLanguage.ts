import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

export function useLanguage() {
  const { i18n } = useTranslation()

  const currentLang = i18n.language as 'zh' | 'en'
  const isZh = currentLang === 'zh'

  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(isZh ? 'en' : 'zh')
  }, [i18n, isZh])

  return { currentLang, isZh, toggleLanguage }
}
