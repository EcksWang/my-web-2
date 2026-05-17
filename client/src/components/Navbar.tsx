import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitch from './LanguageSwitch'
import { ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { t } = useTranslation()
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const linkClass = "text-[#D7E2EA] font-medium uppercase tracking-wider text-sm sm:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200 flex items-center gap-1"

  return (
    <nav className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 w-full" ref={dropdownRef}>
      <Link to="/" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm sm:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200">
        汪航 | Wang Hang
      </Link>
      <div className="flex items-center gap-6 md:gap-10">
        <a href="/" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm sm:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200">{t('nav.home')}</a>

        {/* About dropdown */}
        <div className="relative">
          <button onClick={() => setOpenDropdown(openDropdown === 'about' ? null : 'about')} className={linkClass}>
            {t('nav.about')}
            <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === 'about' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'about' && (
            <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl py-2 min-w-[160px] shadow-xl z-50">
              <button onClick={() => { navigate('/resume'); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">{isZh ? '个人简历' : 'Resume'}</button>
              <button onClick={() => { navigate('/works/skills'); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">{isZh ? '技能树' : 'Skills'}</button>
              <button onClick={() => { navigate('/works/awards'); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">{isZh ? '奖项荣誉' : 'Awards'}</button>
            </div>
          )}
        </div>

        <a href="#services" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm sm:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200">{isZh ? '项目经历' : 'Experience'}</a>

        {/* Works dropdown */}
        <div className="relative">
          <button onClick={() => setOpenDropdown(openDropdown === 'works' ? null : 'works')} className={linkClass}>
            {t('nav.works')}
            <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === 'works' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'works' && (
            <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl py-2 min-w-[160px] shadow-xl z-50">
              <button onClick={() => { navigate('/works/images'); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">{isZh ? '图片作品' : 'Image Works'}</button>
              <button onClick={() => { navigate('/works/videos'); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">{isZh ? '视频作品' : 'Video Works'}</button>
              <button onClick={() => { navigate('/works/cases'); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">{isZh ? '商业案例' : 'Case Studies'}</button>
            </div>
          )}
        </div>

        <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
      </div>
    </nav>
  )
}
