interface LanguageSwitchProps {
  isZh: boolean
  onToggle: () => void
}

export default function LanguageSwitch({ isZh, onToggle }: LanguageSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm sm:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200"
    >
      <span className={isZh ? 'text-white' : 'opacity-50'}>中</span>
      <span className="mx-0.5 opacity-50">/</span>
      <span className={!isZh ? 'text-white' : 'opacity-50'}>EN</span>
    </button>
  )
}
