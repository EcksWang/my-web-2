import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Award } from 'lucide-react'
import axios from 'axios'
import LanguageSwitch from '../components/LanguageSwitch'
import { useLanguage } from '../hooks/useLanguage'

interface AwardItem {
  id: number
  name_zh: string
  name_en: string
  organization_zh: string
  organization_en: string
  year: number
  project_url: string
  image_url?: string
}

export default function Awards() {
  const { i18n } = useTranslation()
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const lang = i18n.language as 'zh' | 'en'
  const [awards, setAwards] = useState<AwardItem[]>([])

  useEffect(() => {
    axios.get('/api/awards').then(r => setAwards(r.data)).catch(() => {})
  }, [])

  const years = [...new Set(awards.map(a => a.year))].sort((a, b) => b - a)

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 pb-4">
        <button onClick={() => navigate('/')} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
          <ArrowLeft size={18} /> {isZh ? '返回首页' : 'Back to Home'}
        </button>
        <div className="flex items-center gap-6">
          <span className="text-[#D7E2EA] font-semibold uppercase tracking-wider text-sm sm:text-base">
            {isZh ? '奖项荣誉' : 'Awards'}
          </span>
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
        </div>
      </div>

      <div className="px-4 md:px-8 pb-20 max-w-3xl mx-auto">
        {years.length === 0 && (
          <p className="text-[#D7E2EA]/40 text-sm text-center py-20">{isZh ? '暂无奖项' : 'No awards yet'}</p>
        )}

        {years.map((year, yi) => (
          <div key={year} className="relative pl-8 sm:pl-12 pb-12 last:pb-0">
            {/* Timeline line */}
            {yi < years.length && (
              <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-0 w-px bg-[#D7E2EA]/10" />
            )}

            {/* Year marker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="absolute left-0 sm:left-1 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#D7E2EA] flex items-center justify-center">
                <Award size={12} className="text-[#0C0C0C]" />
              </div>
              <span className="text-[#D7E2EA] font-black text-3xl sm:text-4xl tracking-tighter">{year}</span>
            </motion.div>

            {/* Awards for this year */}
            {awards.filter(a => a.year === year).map((award, ai) => (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ai * 0.1 }}
                className="mb-4 ml-2"
              >
                <div className="bg-[#111] border border-[#D7E2EA]/5 rounded-xl overflow-hidden">
                  {award.image_url && (
                    <img src={award.image_url} alt="" className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-[#D7E2EA] font-medium text-sm sm:text-base">
                      {lang === 'zh' ? award.name_zh : award.name_en}
                    </h3>
                    <p className="text-[#D7E2EA]/40 text-xs mt-1">
                      {lang === 'zh' ? award.organization_zh : award.organization_en}
                    </p>
                    {award.project_url && (
                      <a
                        href={award.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D7E2EA]/40 hover:text-[#D7E2EA] text-xs mt-2 inline-block underline underline-offset-2"
                      >
                        {isZh ? '查看作品' : 'View Work'} →
                    </a>
                  )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
