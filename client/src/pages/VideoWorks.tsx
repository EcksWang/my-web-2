import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play } from 'lucide-react'
import axios from 'axios'
import LanguageSwitch from '../components/LanguageSwitch'
import { useLanguage } from '../hooks/useLanguage'
import { embedVideoUrl } from '../lib/videoUrl'

interface Video {
  id: number
  title_zh: string
  title_en: string
  bilibili_url: string
  thumbnail: string
  duration: string
  category: string
  video_file?: string
}

export default function VideoWorks() {
  const { i18n } = useTranslation()
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const lang = i18n.language as 'zh' | 'en'
  const [videos, setVideos] = useState<Video[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    axios.get('/api/videos').then(r => {
      const data: Video[] = r.data
      setVideos(data)
      setActiveId(data[0]?.id ?? null)
    }).catch(() => {})
  }, [])

  const categories = useMemo(() => ['all', ...new Set(videos.map(v => v.category).filter(Boolean))], [videos])
  const [activeCategory, setActiveCategory] = useState('all')
  const filtered = useMemo(() => activeCategory === 'all' ? videos : videos.filter(v => v.category === activeCategory), [activeCategory, videos])

  const activeVideo = videos.find(v => v.id === activeId)

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollerRef.current) return
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    e.preventDefault()
    scrollerRef.current.scrollLeft += e.deltaY
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] overflow-hidden">
      <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 pb-4">
        <button onClick={() => navigate('/')} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
          <ArrowLeft size={18} /> {isZh ? '返回首页' : 'Back to Home'}
        </button>
        <div className="flex items-center gap-6">
          <span className="text-[#D7E2EA] font-semibold uppercase tracking-wider text-sm sm:text-base">
            {isZh ? '视频作品' : 'Video Works'}
          </span>
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
        </div>
      </div>

      <main className="px-5 md:px-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pt-8 pb-8">
          <div>
            <h1 className={`hero-heading font-black uppercase tracking-tighter leading-none ${isZh ? 'text-[clamp(3.2rem,12vw,150px)]' : 'text-[clamp(2.6rem,8vw,112px)]'}`}>
              {isZh ? '视频作品' : 'Video Works'}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-colors ${activeCategory === cat ? 'bg-[#D7E2EA] text-[#0C0C0C] font-medium' : 'bg-[#D7E2EA]/10 text-[#D7E2EA]/60 hover:bg-[#D7E2EA]/20 hover:text-[#D7E2EA]'}`}>
                {cat === 'all' ? (isZh ? '全部' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-[#D7E2EA]/40 text-sm text-center py-20">{isZh ? '暂无视频' : 'No videos yet'}</p>
        ) : (
          <div ref={scrollerRef} onWheel={handleWheel} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-8 snap-x snap-mandatory cursor-ew-resize" style={{ scrollbarWidth: 'none' }}>
            {filtered.map((video, index) => {
              const active = video.id === activeId
              const title = lang === 'zh' ? video.title_zh : video.title_en
              const hasFile = !!video.video_file
              const src = hasFile ? video.video_file : embedVideoUrl(video.bilibili_url)

              return (
                <article
                  key={video.id}
                  onClick={() => setActiveId(video.id)}
                  className={`snap-center shrink-0 h-[58vh] min-h-[420px] rounded-[32px] border border-[#D7E2EA]/20 bg-[#111] overflow-hidden transition-all duration-500 ease-out ${active ? 'w-[min(1000px,86vw)] border-[#D7E2EA]/70' : 'w-[170px] sm:w-[220px] hover:border-[#D7E2EA]/45 cursor-pointer'}`}
                >
                  {active ? (
                    <div className="flex flex-col h-full">
                      <div className="relative flex-1 min-h-0 bg-black">
                        {hasFile ? (
                          <video src={src} className="w-full h-full object-contain" controls playsInline controlsList="nodownload" disablePictureInPicture onContextMenu={e => e.preventDefault()} poster={video.thumbnail || ''} />
                        ) : (
                          <iframe src={src} className="w-full h-full" allow="autoplay" title={title} />
                        )}
                        <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-white/80 text-xs uppercase tracking-[0.3em]">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="p-5 bg-[#0C0C0C]">
                        <p className="text-[#D7E2EA]/60 text-xs uppercase tracking-widest mb-1">{video.category || ''}</p>
                        <h3 className="text-[#D7E2EA] text-base font-medium">{title}</h3>
                        {video.duration && <p className="text-[#D7E2EA]/30 text-xs mt-1">{video.duration}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img src={video.thumbnail || 'https://picsum.photos/220/400'} alt={title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-3">
                        <Play size={28} fill="white" color="white" className="mb-2 opacity-80" />
                        <p className="text-white/90 text-xs font-medium text-center line-clamp-3 uppercase tracking-wider">{title}</p>
                        {video.duration && <span className="text-white/50 text-xs mt-2 bg-black/40 px-2 py-0.5 rounded">{video.duration}</span>}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {activeVideo && (
          <div className="mt-6 flex items-center gap-4 text-[#D7E2EA]/40 text-xs">
            <span className="text-[#D7E2EA] font-medium">{activeId ? videos.findIndex(v => v.id === activeId) + 1 : 1} / {filtered.length}</span>
            <span>{lang === 'zh' ? (activeVideo?.title_zh || '') : (activeVideo?.title_en || '')}</span>
          </div>
        )}
      </main>
    </div>
  )
}
