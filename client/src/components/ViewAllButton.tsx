import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface ViewAllButtonProps {
  to?: string
}

export default function ViewAllButton({ to }: ViewAllButtonProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to || '/works/images')}
      className="rounded-full px-6 py-2 sm:px-8 sm:py-3 text-[#D7E2EA] font-medium uppercase tracking-[0.25em] text-xs sm:text-sm border-2 border-[#D7E2EA] hover:bg-[#D7E2EA]/10 transition-colors duration-200"
    >
      {t('projects.viewAll')}
    </button>
  )
}
