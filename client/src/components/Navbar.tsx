import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitch from './LanguageSwitch'
import { ChevronDown, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { t } = useTranslation()
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
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
  const mobileLinkClass = "text-[#D7E2EA] font-medium uppercase tracking-wider text-base hover:opacity-70 py-3 px-4 rounded-xl hover:bg-[#D7E2EA]/5 transition-colors"

  const aboutLinks = [
    { path: '/resume', labelZh: '个人简历', labelEn: 'Resume' },
    { path: '/works/skills', labelZh: '技能树', labelEn: 'Skills' },
    { path: '/works/awards', labelZh: '奖项荣誉', labelEn: 'Awards' },
  ]
  const worksLinks = [
    { path: '/works/images', labelZh: '图片作品', labelEn: 'Image Works' },
    { path: '/works/videos', labelZh: '视频作品', labelEn: 'Video Works' },
    { path: '/works/cases', labelZh: '商业案例', labelEn: 'Case Studies' },
  ]

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 w-full" ref={dropdownRef}>
        <Link to="/" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm sm:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200">
          汪航 | Wang Hang
        </Link>
        <div className="flex items-center gap-6 md:gap-10">
          <a href="/#/" className={linkClass}>{t('nav.home')}</a>
          <div className="relative">
            <button onClick={() => setOpenDropdown(openDropdown === 'about' ? null : 'about')} className={linkClass}>
              {t('nav.about')}
              <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === 'about' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'about' && (
              <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl py-2 min-w-[160px] shadow-xl z-50">
                {aboutLinks.map(l => (
                  <button key={l.path} onClick={() => { navigate(l.path); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">
                    {isZh ? l.labelZh : l.labelEn}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a href="/#/services" className={linkClass}>{isZh ? '项目经历' : 'Experience'}</a>
          <div className="relative">
            <button onClick={() => setOpenDropdown(openDropdown === 'works' ? null : 'works')} className={linkClass}>
              {t('nav.works')}
              <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === 'works' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'works' && (
              <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl py-2 min-w-[160px] shadow-xl z-50">
                {worksLinks.map(l => (
                  <button key={l.path} onClick={() => { navigate(l.path); setOpenDropdown(null) }} className="block w-full text-left px-4 py-2.5 text-[#D7E2EA] text-sm uppercase tracking-wider hover:bg-[#D7E2EA]/10 transition-colors">
                    {isZh ? l.labelZh : l.labelEn}
                  </button>
                ))}
              </div>
            )}
          </div>
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
        </div>
      </nav>

      {/* Mobile - hamburger */}
      <div className="md:hidden flex justify-between items-center px-6 pt-6 w-full">
        <Link to="/" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm" onClick={() => setMobileOpen(false)}>
          汪航 | Wang Hang
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#D7E2EA] p-1">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-6 pb-4 space-y-1 bg-[#0C0C0C]">
          <a href="/#/" onClick={() => setMobileOpen(false)} className={`block ${mobileLinkClass}`}>{t('nav.home')}</a>

          <p className="text-[#D7E2EA]/30 text-xs uppercase tracking-widest px-4 pt-2 pb-1">{t('nav.about')}</p>
          {aboutLinks.map(l => (
            <button key={l.path} onClick={() => { navigate(l.path); setMobileOpen(false) }} className={`block w-full text-left ${mobileLinkClass} pl-8`}>
              {isZh ? l.labelZh : l.labelEn}
            </button>
          ))}

          <a href="/#/services" onClick={() => setMobileOpen(false)} className={`block ${mobileLinkClass}`}>{isZh ? '项目经历' : 'Experience'}</a>

          <p className="text-[#D7E2EA]/30 text-xs uppercase tracking-widest px-4 pt-2 pb-1">{t('nav.works')}</p>
          {worksLinks.map(l => (
            <button key={l.path} onClick={() => { navigate(l.path); setMobileOpen(false) }} className={`block w-full text-left ${mobileLinkClass} pl-8`}>
              {isZh ? l.labelZh : l.labelEn}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
