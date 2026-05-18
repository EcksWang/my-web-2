import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, X } from 'lucide-react'
import axios from 'axios'
import LanguageSwitch from '../components/LanguageSwitch'
import { useLanguage } from '../hooks/useLanguage'

interface Skill {
  id: number
  name_zh: string
  name_en: string
  category: string
  proficiency: number
  description_zh: string
  description_en: string
  parent_id: number | null
}

const categoryColors: Record<string, string> = {
  'AI Content Creation Tools': '#A855F7',
  'Operations & Marketing': '#F59E0B',
  'Design & Video Production': '#3B82F6',
  'Office & General Skills': '#10B981',
  '设计技能': '#8B5CF6',
  '软件技能': '#3B82F6',
  '开发技能': '#10B981',
  'Design': '#8B5CF6',
  'Software': '#3B82F6',
  'Development': '#10B981',
}

const colorGradients: Record<string, [string, string]> = {
  '#A855F7': ['#A855F7', '#7C3AED'],
  '#F59E0B': ['#F59E0B', '#D97706'],
  '#3B82F6': ['#2563EB', '#3B82F6'],
  '#10B981': ['#059669', '#10B981'],
  '#8B5CF6': ['#7C3AED', '#8B5CF6'],
  '#D7E2EA': ['#D7E2EA', '#9CA3AF'],
}

export default function SkillsTree() {
  const { i18n } = useTranslation()
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const lang = i18n.language as 'zh' | 'en'
  const [skills, setSkills] = useState<Skill[]>([])
  const [selected, setSelected] = useState<Skill | null>(null)

  useEffect(() => {
    axios.get('/api/skills').then(r => setSkills(r.data)).catch(() => {})
  }, [])

  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 pb-4">
        <button onClick={() => navigate('/')} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
          <ArrowLeft size={18} /> {isZh ? '返回首页' : 'Back to Home'}
        </button>
        <div className="flex items-center gap-6">
          <span className="text-[#D7E2EA] font-semibold uppercase tracking-wider text-sm sm:text-base">
            {isZh ? '技能树' : 'Skills Tree'}
          </span>
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
        </div>
      </div>

      <div className="px-4 md:px-8 pb-20 max-w-4xl mx-auto">
        {skills.length === 0 && (
          <p className="text-[#D7E2EA]/40 text-sm text-center py-20">{isZh ? '暂无数据' : 'No skills data yet'}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, ci) => {
            const catSkills = skills.filter(s => s.category === cat)
            const roots = catSkills.filter(s => !s.parent_id)
            const color = categoryColors[cat] || '#D7E2EA'

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.15 }}
                className="bg-[#111] border border-[#D7E2EA]/5 rounded-2xl p-5 overflow-hidden"
              >
                <div className="h-0.5 -mx-5 -mt-5 mb-4" style={{ backgroundColor: color }} />
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
                  <span className="text-[#D7E2EA]">{cat}</span>
                </h3>

                <div className="space-y-2">
                  {roots.map(skill => {
                    const children = catSkills.filter(s => s.parent_id === skill.id)
                    return (
                      <div key={skill.id}>
                        <button
                          onClick={() => setSelected(skill)}
                          className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-[#D7E2EA]/5 transition-colors group"
                        >
                          <span className="text-[#D7E2EA] text-sm font-medium">{lang === 'zh' ? skill.name_zh : skill.name_en}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#D7E2EA]/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${skill.proficiency}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full rounded-full"
                                style={{
                                  background: `linear-gradient(90deg, ${(colorGradients[color] || colorGradients['#D7E2EA'])[0]}, ${(colorGradients[color] || colorGradients['#D7E2EA'])[1]})`,
                                }}
                              />
                            </div>
                            <ChevronRight size={14} className="text-[#D7E2EA]/20 group-hover:text-[#D7E2EA]/60 transition-colors" />
                          </div>
                        </button>

                        {children.map(child => (
                          <button
                            key={child.id}
                            onClick={() => setSelected(child)}
                            className="w-full text-left flex items-center justify-between p-2.5 pl-6 rounded-xl hover:bg-[#D7E2EA]/5 transition-colors group"
                          >
                            <span className="text-[#D7E2EA]/70 text-xs">{lang === 'zh' ? child.name_zh : child.name_en}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1 bg-[#D7E2EA]/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${child.proficiency}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.6, delay: 0.3 }}
                                  className="h-full rounded-full"
                                  style={{
                                    background: `linear-gradient(90deg, ${(colorGradients[color] || colorGradients['#D7E2EA'])[0]}80, ${(colorGradients[color] || colorGradients['#D7E2EA'])[1]}80)`,
                                  }}
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Skill detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#D7E2EA] text-lg font-semibold">{lang === 'zh' ? selected.name_zh : selected.name_en}</h3>
                <button onClick={() => setSelected(null)} className="text-[#D7E2EA]/40 hover:text-[#D7E2EA]"><X size={18} /></button>
              </div>
              {(() => {
                const catColor = categoryColors[selected.category] || '#D7E2EA'
                const [c1, c2] = colorGradients[catColor] || colorGradients['#D7E2EA']
                return (
              <div className="mb-4">
                <p className="text-[#D7E2EA]/40 text-xs uppercase tracking-wider mb-1">{isZh ? '熟练度' : 'Proficiency'}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-[#D7E2EA]/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${selected.proficiency}%`, background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                  </div>
                  <span className="text-[#D7E2EA] text-sm font-medium">{selected.proficiency}%</span>
                </div>
              </div>
                )
              })()}
              <div>
                <p className="text-[#D7E2EA]/40 text-xs uppercase tracking-wider mb-1">{isZh ? '说明' : 'Description'}</p>
                <p className="text-[#D7E2EA]/70 text-sm leading-relaxed">
                  {lang === 'zh' ? (selected.description_zh || `${selected.name_zh} - 专业级熟练度`) : (selected.description_en || `${selected.name_en} - Professional proficiency`)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
