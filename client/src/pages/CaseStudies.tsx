import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import axios from 'axios'
import LanguageSwitch from '../components/LanguageSwitch'
import { useLanguage } from '../hooks/useLanguage'

interface CaseStudy {
  id: number
  title_zh: string
  title_en: string
  client_zh: string
  client_en: string
  cover_image: string
  intro_zh: string
  intro_en: string
  process_zh: string
  process_en: string
  result_zh: string
  result_en: string
  images: string
}

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === 'string' && item.length > 0)
  if (typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
    if (typeof parsed === 'string' && parsed.length > 0) return [parsed]
  } catch {
    return raw ? [raw] : []
  }
  return []
}

export default function CaseStudies() {
  const { i18n } = useTranslation()
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const lang = i18n.language as 'zh' | 'en'
  const [cases, setCases] = useState<CaseStudy[]>([])
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    axios.get('/api/case-studies').then(r => {
      setCases(r.data)
      if (r.data[0]) setOpenId(r.data[0].id)
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 pb-8">
        <button onClick={() => navigate('/')} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
          <ArrowLeft size={18} /> {isZh ? '返回首页' : 'Back to Home'}
        </button>
        <div className="flex items-center gap-6">
          <span className="text-[#D7E2EA] font-semibold uppercase tracking-wider text-sm sm:text-base">
            {isZh ? '商业案例' : 'Case Studies'}
          </span>
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
        </div>
      </div>

      <main className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <h1 className={`hero-heading font-black uppercase tracking-tighter leading-none mb-10 ${isZh ? 'text-[clamp(4rem,14vw,180px)]' : 'text-[clamp(3rem,9vw,120px)]'}`}>
          {isZh ? '商业案例' : 'Case Studies'}
        </h1>

        {cases.length === 0 && (
          <p className="text-[#D7E2EA]/40 text-sm text-center py-20">{isZh ? '暂无案例' : 'No case studies yet'}</p>
        )}

        <div className="space-y-3">
          {cases.map((item, index) => {
            const open = openId === item.id
            const images = parseImages(item.images)
            return (
              <section key={item.id} className="border border-[#D7E2EA]/10 rounded-2xl overflow-hidden bg-[#101010]">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-6 py-5 text-left hover:bg-[#D7E2EA]/5 transition-colors"
                >
                  <span className="text-[#D7E2EA]/40 font-black text-3xl md:text-5xl tracking-tighter">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[#D7E2EA]/40 text-xs uppercase tracking-widest mb-1">
                      {lang === 'zh' ? item.client_zh : item.client_en}
                    </span>
                    <span className="block text-[#D7E2EA] text-lg md:text-2xl font-semibold uppercase tracking-wide">
                      {lang === 'zh' ? item.title_zh : item.title_en}
                    </span>
                  </span>
                  <ChevronDown className={`text-[#D7E2EA]/50 transition-transform ${open ? 'rotate-180' : ''}`} size={22} />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-[42%_1fr] gap-5 px-4 md:px-6 pb-6">
                        <div className="rounded-2xl overflow-hidden bg-black min-h-[260px]">
                          {item.cover_image ? (
                            <img src={item.cover_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="h-full flex items-center justify-center text-[#D7E2EA]/20 text-xs uppercase">
                              {isZh ? '案例封面' : 'Case Cover'}
                            </div>
                          )}
                        </div>

                        <div className="space-y-5 text-[#D7E2EA]/70 text-sm leading-relaxed">
                          <div>
                            <h3 className="text-[#D7E2EA] text-xs uppercase tracking-widest mb-2">{isZh ? '项目背景' : 'Background'}</h3>
                            <p className="whitespace-pre-line">{lang === 'zh' ? item.intro_zh : item.intro_en}</p>
                          </div>
                          <div>
                            <h3 className="text-[#D7E2EA] text-xs uppercase tracking-widest mb-2">{isZh ? '项目过程' : 'Process'}</h3>
                            <p className="whitespace-pre-line">{lang === 'zh' ? item.process_zh : item.process_en}</p>
                          </div>
                          <div>
                            <h3 className="text-[#D7E2EA] text-xs uppercase tracking-widest mb-2">{isZh ? '最终成果' : 'Results'}</h3>
                            <p className="whitespace-pre-line">{lang === 'zh' ? item.result_zh : item.result_en}</p>
                          </div>
                        </div>
                      </div>

                      {images.length > 0 && (
                        <div className="px-4 md:px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                          {images.map((img, i) => (
                            <img key={`${item.id}-${i}`} src={img} alt="" className="w-full aspect-[4/3] object-cover rounded-xl" />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
