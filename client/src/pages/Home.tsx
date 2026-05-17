import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import axios from 'axios'
import Navbar from '../components/Navbar'
import ContactButton from '../components/ContactButton'
import ViewAllButton from '../components/ViewAllButton'
import FadeIn from '../components/FadeIn'
import Magnet from '../components/Magnet'
import AnimatedText from '../components/AnimatedText'
import ContactModal from '../components/ContactModal'
import { useSiteContent } from '../hooks/useSiteContent'
import { embedVideoUrl } from '../lib/videoUrl'

const FALLBACK_IMG = 'https://picsum.photos/420/270'

function useMarqueeImages() {
  const [row1, setRow1] = useState<Array<{ id: number; url: string }>>([])
  const [row2, setRow2] = useState<Array<{ id: number; url: string }>>([])

  useEffect(() => {
    axios.get('/api/marquee').then(res => {
      const all: Array<{ id: number; image_url: string; row_number: number }> = res.data
      const r1 = all.filter(i => i.row_number === 1).map(i => ({ id: i.id, url: i.image_url }))
      const r2 = all.filter(i => i.row_number === 2).map(i => ({ id: i.id, url: i.image_url }))
      if (r1.length === 0) r1.push({ id: 0, url: FALLBACK_IMG })
      if (r2.length === 0) r2.push({ id: 999, url: FALLBACK_IMG })
      setRow1(r1)
      setRow2(r2)
    }).catch(() => {
      setRow1([{ id: 0, url: FALLBACK_IMG }])
      setRow2([{ id: 999, url: FALLBACK_IMG }])
    })
  }, [])

  const tripledRow1 = [...row1, ...row1, ...row1]
  const tripledRow2 = [...row2, ...row2, ...row2]
  return { tripledRow1, tripledRow2 }
}

interface ProjectData {
  id: number
  title_zh: string
  title_en: string
  category: string
  cover_image: string
  images: string
  sort_order: number
  video_url?: string
  video_ratio?: string
  video_file?: string
}

interface DisplayProject {
  id: number
  num: string
  category: string
  name: string
  cover_image?: string
  images: string[]
  video_url?: string
  video_ratio?: string
  video_file?: string
}

interface ServiceData {
  id: number
  num: string
  name_zh: string
  name_en: string
  desc_zh: string
  desc_en: string
  sort_order: number
}

const fallbackProjects: DisplayProject[] = [
  { id: 0, num: '01', category: 'Brand Identity', name: 'Brand Identity Collection', images: ['https://picsum.photos/seed/fp1a/400/500', 'https://picsum.photos/seed/fp1b/400/300', 'https://picsum.photos/seed/fp1c/600/400'] },
  { id: 1, num: '02', category: '3D Rendering', name: '3D Product Renders', images: ['https://picsum.photos/seed/fp2a/400/500', 'https://picsum.photos/seed/fp2b/400/300', 'https://picsum.photos/seed/fp2c/600/400'] },
  { id: 2, num: '03', category: 'Motion Graphics', name: 'Motion Graphics Reel', images: ['https://picsum.photos/seed/fp3a/400/500', 'https://picsum.photos/seed/fp3b/400/300', 'https://picsum.photos/seed/fp3c/600/400'] },
]

function parseImageList(value: unknown, coverImage: string): string[] {
  let images: unknown = value

  for (let i = 0; i < 2 && typeof images === 'string'; i += 1) {
    try {
      images = JSON.parse(images)
    } catch {
      images = images ? [images] : []
    }
  }

  const list = Array.isArray(images) ? images.filter((item): item is string => typeof item === 'string' && item.length > 0) : []
  const base = list.length > 0 ? list : [coverImage || FALLBACK_IMG]
  return [...base, ...base, ...base].slice(0, 3)
}

function useFeaturedProjects() {
  const [projects, setProjects] = useState<ProjectData[]>([])

  useEffect(() => {
    axios.get('/api/projects?featured=true').then(res => {
      setProjects(res.data)
    }).catch(() => setProjects([]))
  }, [])

  return projects
}

function useServices() {
  const [services, setServices] = useState<ServiceData[]>([])

  useEffect(() => {
    axios.get('/api/services').then(res => {
      setServices(res.data)
    }).catch(() => setServices([]))
  }, [])

  return services
}

function useTitleSizing() {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  return {
    hero: isZh
      ? 'text-[15vw] sm:text-[16vw] md:text-[17vw] lg:text-[18vw]'
      : 'text-[7vw] sm:text-[8vw] md:text-[9vw] lg:text-[10vw]',
    about: isZh
      ? 'text-[clamp(3rem,9vw,118px)]'
      : 'text-[clamp(2.5rem,7vw,92px)]',
    services: isZh
      ? 'text-[clamp(3.6rem,11vw,160px)]'
      : 'text-[clamp(2.8rem,8vw,120px)]',
    works: isZh
      ? 'text-[clamp(3.2rem,10vw,140px)]'
      : 'text-[clamp(2.6rem,7vw,108px)]',
  }
}

function HeroSection() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en'
  const { get, getPortrait } = useSiteContent()
  const [contactOpen, setContactOpen] = useState(false)
  const titleSize = useTitleSizing()

  return (
    <section className="relative h-screen flex flex-col overflow-x-clip">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Navbar />
      </motion.div>

      <div className="flex-1 flex items-center justify-center overflow-hidden relative z-20">
        <FadeIn delay={0.15} y={40}>
          <h1 className={`hero-heading font-black uppercase tracking-tighter leading-none whitespace-nowrap w-full text-center mt-6 sm:mt-4 md:-mt-5 ${titleSize.hero}`}>
            {t('hero.greeting')}
          </h1>
        </FadeIn>
      </div>

      <Magnet margin={600} strength={4} centerY={false} className="absolute left-1/2 top-[58%] sm:top-[55%] z-10 w-[140px] sm:w-[220px] md:w-[260px] lg:w-[300px] md:top-[58%]">
        <FadeIn delay={0.6} y={30}>
          <img
            src={getPortrait()}
            alt="Wang Hang"
            fetchpriority="high"
            loading="eager"
            className="w-full h-auto rounded-3xl"
          />
        </FadeIn>
      </Magnet>

      <div className="flex justify-between items-end pb-7 sm:pb-8 md:pb-10 px-6 md:px-10 w-full">
        <FadeIn delay={0.35} y={20}>
          <p className="text-[#D7E2EA] font-light uppercase tracking-wider leading-tight max-w-[160px] sm:max-w-[220px] md:max-w-[260px] text-[clamp(0.75rem,1.5vw,1.5rem)]">
            {get('hero_description', lang, t('hero.description'))}
          </p>
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton onClick={() => setContactOpen(true)} />
        </FadeIn>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  )
}

function MarqueeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const { tripledRow1, tripledRow2 } = useMarqueeImages()

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const sectionTop = window.scrollY + rect.top
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3
      setScrollOffset(offset)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={ref} className="bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden">
      <div
        className="flex gap-3 mb-3"
        style={{ transform: `translateX(${-scrollOffset}px)`, willChange: 'transform' }}
      >
        {tripledRow1.map((img, i) => (
          <img
            key={`r1-${i}`}
            src={img.url}
            alt=""
            loading="lazy"
            className="w-[420px] h-[270px] object-cover rounded-3xl shrink-0"
          />
        ))}
      </div>
      <div
        className="flex gap-3"
        style={{ transform: `translateX(${scrollOffset}px)`, willChange: 'transform' }}
      >
        {tripledRow2.map((img, i) => (
          <img
            key={`r2-${i}`}
            src={img.url}
            alt=""
            loading="lazy"
            className="w-[420px] h-[270px] object-cover rounded-3xl shrink-0"
          />
        ))}
      </div>
    </section>
  )
}

function AboutSection() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en'
  const { get } = useSiteContent()
  const [contactOpen, setContactOpen] = useState(false)
  const titleSize = useTitleSizing()

  return (
    <section id="about" className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10 py-20 overflow-hidden">
      <FadeIn delay={0.1} x={-80} duration={0.9} className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] w-[120px] sm:w-[160px] md:w-[210px]">
        <img src={get('about_corner_1', lang, 'https://picsum.photos/seed/corner1/210/210')} alt="" className="w-full h-auto opacity-60" />
      </FadeIn>
      <FadeIn delay={0.15} x={80} duration={0.9} className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] w-[120px] sm:w-[160px] md:w-[210px]">
        <img src={get('about_corner_2', lang, 'https://picsum.photos/seed/corner2/210/210')} alt="" className="w-full h-auto opacity-60" />
      </FadeIn>
      <FadeIn delay={0.25} x={-80} duration={0.9} className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] w-[100px] sm:w-[140px] md:w-[180px]">
        <img src={get('about_corner_3', lang, 'https://picsum.photos/seed/corner3/180/180')} alt="" className="w-full h-auto opacity-60" />
      </FadeIn>
      <FadeIn delay={0.3} x={80} duration={0.9} className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] w-[130px] sm:w-[170px] md:w-[220px]">
        <img src={get('about_corner_4', lang, 'https://picsum.photos/seed/corner4/220/220')} alt="" className="w-full h-auto opacity-60" />
      </FadeIn>

      <div className="text-center max-w-[560px] mx-auto">
        <FadeIn delay={0} y={40}>
          <h2 className={`hero-heading font-black uppercase tracking-tighter leading-none text-center whitespace-nowrap ${titleSize.about}`}>
            {t('about.title')}
          </h2>
        </FadeIn>

        <div className="mt-10 sm:mt-14 md:mt-16">
          <AnimatedText
            text={get('about_text', lang, t('about.text'))}
            className="text-[#D7E2EA] font-medium text-center leading-relaxed text-[clamp(0.9rem,2vw,1.1rem)] max-w-[560px] mx-auto"
          />
        </div>

        <FadeIn delay={0.4} y={20} className="mt-16 sm:mt-20 md:mt-24">
          <span id="contact" className="block scroll-mt-24" />
          <ContactButton onClick={() => setContactOpen(true)} />
        </FadeIn>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  )
}

function ServicesSection() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'zh' | 'en'
  const titleSize = useTitleSizing()
  const apiServices = useServices()
  const i18nServices = t('services.items', { returnObjects: true }) as Array<{ num: string; name: string; desc: string }>
  const services = apiServices.length > 0
    ? apiServices.map(item => ({
        num: item.num,
        name: lang === 'zh' ? item.name_zh : item.name_en,
        desc: lang === 'zh' ? item.desc_zh : item.desc_en,
      }))
    : i18nServices

  return (
    <section id="services" className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <FadeIn delay={0} y={40}>
        <h2 className={`text-[#0C0C0C] font-black uppercase text-center tracking-tighter leading-none mb-16 sm:mb-20 md:mb-28 ${titleSize.services}`}>
          {t('services.title')}
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto">
        {services.map((item, i) => (
          <FadeIn key={i} delay={i * 0.1} y={20}>
            <div className="flex gap-6 sm:gap-10 md:gap-16 py-8 sm:py-10 md:py-12 border-t border-gray-200 last:border-b">
              <span className="text-[#0C0C0C] font-black text-[clamp(3rem,6vw,5rem)] tracking-tighter leading-none shrink-0">
                {item.num || String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-[#0C0C0C] font-medium uppercase text-[clamp(1rem,2.5vw,1.6rem)] tracking-wider mb-2">
                  {item.name}
                </h3>
                <p className="text-[#0C0C0C]/60 font-light leading-relaxed max-w-2xl text-[clamp(0.85rem,1.5vw,1rem)]">
                  {item.desc}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

function FeaturedProjectCard({
  project,
  index,
  total,
  scrollYProgress,
}: {
  project: DisplayProject
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const scale = useTransform(scrollYProgress, [index * 0.25, (index + 1) * 0.25], [1, 1 - (total - 1 - index) * 0.03])
  const [playing, setPlaying] = useState(false)
  const isVertical = project.video_ratio === '9:16'
  const videoFrameClass = isVertical ? 'aspect-[4/3]' : 'aspect-video'

  return (
    <motion.div
      className="sticky rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 overflow-hidden"
      style={{
        top: `${20 + index * 24}px`,
        height: typeof window !== 'undefined' && window.innerWidth < 640 ? 'min(75vh, 520px)' : '85vh',
        scale,
        zIndex: 10 + index,
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-baseline gap-6">
          <span className="text-[#D7E2EA] font-black text-[clamp(3rem,6vw,5rem)] tracking-tighter leading-none">
            {project.num}
          </span>
          <div>
            <p className="text-[#D7E2EA]/60 font-light uppercase tracking-widest text-sm mb-1">
              {project.category}
            </p>
            <h3 className="text-[#D7E2EA] font-medium uppercase text-[clamp(1rem,2vw,1.4rem)] tracking-wider">
              {project.name}
            </h3>
          </div>
        </div>
        <ViewAllButton to={project.video_url || project.video_file ? '/works/videos' : '/works/images'} />
      </div>

      <div className="flex gap-3 h-[calc(85vh-180px)] sm:h-[calc(85vh-200px)] min-h-[200px]">
        {project.video_file ? (
          <div className={`w-full ${project.video_ratio === '9:16' ? 'aspect-[4/3]' : 'aspect-video'} max-h-full rounded-3xl overflow-hidden relative bg-black`}>
            <video src={project.video_file} className="w-full h-full object-contain" controls playsInline preload="metadata" controlsList="nodownload" disablePictureInPicture onContextMenu={e => e.preventDefault()} poster={project.cover_image || project.images[0] || ''} />
          </div>
        ) : project.video_url ? (
          <div
            className={`w-full ${videoFrameClass} max-h-full rounded-3xl overflow-hidden relative bg-black group`}
          >
            {playing ? (
              <>
                <iframe
                  src={embedVideoUrl(project.video_url || '')}
                  className="w-full h-full"
                  allow="autoplay"
                  title={project.name}
                />
                <button
                  onClick={() => setPlaying(false)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-sm transition-colors"
                >
                  ✕
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="relative w-full h-full cursor-pointer"
                aria-label="Play video"
              >
                <img
                  src={project.cover_image || project.images[0] || ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                    <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                      <path d="M0 0v28l24-14L0 0z" fill="#0C0C0C" />
                    </svg>
                  </span>
                </span>
                <a
                  href={project.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="absolute bottom-3 right-3 text-white/40 hover:text-white/80 text-xs underline underline-offset-2 transition-colors"
                >
                  {project.video_url.includes('douyin') || project.video_url.includes('xiaohongshu') ? '↗' : ''}
                </a>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="w-[40%] flex flex-col gap-3">
              <img src={project.images[0]} alt="" className="w-full h-[55%] object-cover rounded-3xl" />
              <img src={project.images[1]} alt="" className="w-full h-[45%] object-cover rounded-3xl" />
            </div>
            <div className="w-[60%]">
              <img src={project.images[2]} alt="" className="w-full h-full object-cover rounded-3xl" />
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

function FeaturedProjectsSection() {
  const { t, i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const apiProjects = useFeaturedProjects()
  const titleSize = useTitleSizing()

  const displayProjects = apiProjects.length > 0
    ? apiProjects.map(p => ({
        id: p.id,
        num: String(p.sort_order + 1).padStart(2, '0'),
        category: p.category,
        name: isZh ? p.title_zh : p.title_en,
        cover_image: p.cover_image,
        images: parseImageList(p.images, p.cover_image),
        video_url: p.video_url || '',
        video_ratio: p.video_ratio || '16:9',
        video_file: p.video_file || '',
      }))
    : fallbackProjects

  return (
    <section id="works" ref={ref} className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 relative pb-20">
      <div className="px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 mb-16">
        <FadeIn delay={0} y={40}>
          <h2 className={`hero-heading font-black uppercase tracking-tighter leading-none text-center ${titleSize.works}`}>
            {t('projects.title')}
          </h2>
        </FadeIn>
      </div>

      <div className="relative px-5 sm:px-8 md:px-10">
        {displayProjects.map((project, i) => (
          <FeaturedProjectCard
            key={project.id || i}
            project={project}
            index={i}
            total={displayProjects.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="bg-[#0C0C0C] relative" style={{ overflowX: 'clip' }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <FeaturedProjectsSection />
      <a
        href="/admin"
        className="fixed bottom-4 right-4 w-8 h-8 rounded-full bg-[#D7E2EA]/5 hover:bg-[#D7E2EA]/15 transition-colors z-50 flex items-center justify-center opacity-30 hover:opacity-70"
        title="Admin"
      >
        <span className="text-[#D7E2EA] text-xs">·</span>
      </a>
    </main>
  )
}
