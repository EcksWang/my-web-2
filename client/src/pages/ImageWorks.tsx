import { useEffect, useMemo, useRef, useState } from 'react'
import type { WheelEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import axios from 'axios'
import LanguageSwitch from '../components/LanguageSwitch'
import { useLanguage } from '../hooks/useLanguage'

const FALLBACK_IMG = 'https://picsum.photos/900/1200'

interface Project {
  id: number
  title_zh: string
  title_en: string
  description_zh?: string
  description_en?: string
  category: string
  cover_image: string
  images: string
  sort_order: number
}

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((i: unknown): i is string => typeof i === 'string' && i.length > 0)
  if (typeof raw !== 'string') return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((i: unknown): i is string => typeof i === 'string' && i.length > 0) : []
  } catch {
    return raw ? [raw] : []
  }
}

function bestCover(project: Project): string {
  if (project.cover_image) return project.cover_image
  const imgs = parseImages(project.images)
  return imgs[0] || FALLBACK_IMG
}

export default function ImageWorks() {
  const { i18n } = useTranslation()
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lang = i18n.language as 'zh' | 'en'
  const [projects, setProjects] = useState<Project[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeId, setActiveId] = useState<number | null>(null)

  useEffect(() => {
    axios.get('/api/projects').then(r => {
      const nonFeatured = (r.data as Project[]).filter(p => !(p as any).is_featured)
      setProjects(nonFeatured)
      setActiveId(nonFeatured[0]?.id ?? null)
    }).catch(() => {})
  }, [])

  const categories = useMemo(
    () => ['all', ...new Set(projects.map(p => p.category).filter(Boolean))],
    [projects]
  )

  const filtered = useMemo(
    () => activeCategory === 'all' ? projects : projects.filter(p => p.category === activeCategory),
    [activeCategory, projects]
  )

  useEffect(() => {
    if (!filtered.some(p => p.id === activeId)) {
      setActiveId(filtered[0]?.id ?? null)
    }
  }, [activeId, filtered])

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!scrollerRef.current) return
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.preventDefault()
    scrollerRef.current.scrollLeft += event.deltaY
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] overflow-hidden">
      <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 pb-4">
        <button onClick={() => navigate('/')} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
          <ArrowLeft size={18} />
          {isZh ? '返回首页' : 'Back to Home'}
        </button>
        <div className="flex items-center gap-6">
          <span className="text-[#D7E2EA] font-semibold uppercase tracking-wider text-sm sm:text-base">
            {isZh ? '图片作品' : 'Image Works'}
          </span>
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
        </div>
      </div>

      <main className="px-5 md:px-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pt-8 pb-8">
          <div>
            <h1 className={`hero-heading font-black uppercase tracking-tighter leading-none ${isZh ? 'text-[clamp(3.2rem,12vw,150px)]' : 'text-[clamp(2.6rem,8vw,112px)]'}`}>
              {isZh ? '图片作品' : 'Image Works'}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${activeCategory === cat ? 'bg-[#D7E2EA] text-[#0C0C0C] font-medium' : 'bg-[#D7E2EA]/10 text-[#D7E2EA]/60 hover:bg-[#D7E2EA]/20 hover:text-[#D7E2EA]'}`}
              >
                {cat === 'all' ? (isZh ? '全部' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-[#D7E2EA]/40 text-sm text-center py-20">
            {isZh ? '暂无作品' : 'No works yet'}
          </p>
        ) : (
          <div
            ref={scrollerRef}
            onWheel={handleWheel}
            className="flex gap-4 overflow-x-auto overflow-y-hidden pb-8 snap-x snap-mandatory cursor-ew-resize"
            style={{ scrollbarWidth: 'none' }}
          >
            {filtered.map((project, index) => {
              const active = project.id === activeId
              const title = lang === 'zh' ? project.title_zh : project.title_en
              const description = lang === 'zh' ? project.description_zh : project.description_en
              const cover = bestCover(project)

              return (
                <article
                  key={project.id}
                  onClick={() => setActiveId(project.id)}
                  className={`snap-center shrink-0 h-[62vh] min-h-[460px] max-h-[680px] rounded-[32px] border border-[#D7E2EA]/20 bg-[#111] overflow-hidden transition-all duration-500 ease-out ${active ? 'w-[min(1120px,88vw)] border-[#D7E2EA]/70' : 'w-[170px] sm:w-[220px] hover:border-[#D7E2EA]/45'}`}
                >
                  {active ? (
                    <div className="grid h-full grid-cols-1 md:grid-cols-[minmax(0,1fr)_340px]">
                      <div className="relative min-h-0">
                        <img
                          src={cover}
                          alt={title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
                        />
                        <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-white/80 text-xs uppercase tracking-[0.3em]">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between bg-[#0C0C0C] p-6 md:p-8">
                        <div>
                          <p className="text-[#D7E2EA]/45 text-xs uppercase tracking-[0.3em] mb-4">
                            {project.category || (isZh ? '未分类' : 'Uncategorized')}
                          </p>
                          <h2 className="text-[#D7E2EA] text-[clamp(1.6rem,3.5vw,3rem)] font-black uppercase leading-none tracking-tight">
                            {title || (isZh ? '未命名作品' : 'Untitled Work')}
                          </h2>
                          <p className="text-[#D7E2EA]/68 text-sm md:text-base leading-relaxed mt-6 whitespace-pre-line">
                            {description || (isZh ? '可以在后台作品管理里补充这张图片作品的介绍。' : 'Add this image work introduction in the admin project manager.')}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#D7E2EA]/10 pt-5 mt-8">
                          <span className="text-[#D7E2EA]/45 text-xs uppercase tracking-[0.28em]">
                            {isZh ? '滚轮横向浏览' : 'Scroll sideways'}
                          </span>
                          <ArrowRight size={18} className="text-[#D7E2EA]/50" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-full group">
                      <img
                        src={cover}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-white/50 text-xs uppercase tracking-[0.25em] mb-3">{String(index + 1).padStart(2, '0')}</p>
                        <h3 className="text-white font-semibold uppercase text-sm leading-tight [writing-mode:vertical-rl] rotate-180 max-h-[260px]">
                          {title || (isZh ? '未命名作品' : 'Untitled Work')}
                        </h3>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
