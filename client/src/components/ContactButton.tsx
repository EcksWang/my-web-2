import { useTranslation } from 'react-i18next'

interface ContactButtonProps {
  onClick?: () => void
}

export default function ContactButton({ onClick }: ContactButtonProps) {
  const { t } = useTranslation()

  return (
    <button
      onClick={onClick}
      className="relative rounded-full px-8 py-3 sm:px-10 sm:py-4 text-white font-medium uppercase tracking-[0.3em] text-sm sm:text-base overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #646973, #8a9aaa)',
        boxShadow: '0 0 0 2px white, 0 0 0 5px rgba(100,105,115,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        outline: '2px solid white',
        outlineOffset: '-3px',
      }}
    >
      {t('hero.contactMe')}
    </button>
  )
}
