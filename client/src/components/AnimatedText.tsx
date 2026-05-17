import { useRef, useState, useMemo } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
}

export default function AnimatedText({ text, className }: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })
  const [p, setP] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v: number) => setP(v))

  const chars = useMemo(() => text.split(''), [text])

  return (
    <div ref={ref} className={`${className ?? ''} relative`}>
      {chars.map((char, i) => {
        if (char === '\n') return <br key={i} />
        const start = i / chars.length
        const end = (i + 1) / chars.length
        let opacity = 0.2
        if (p > start) {
          opacity = 0.2 + Math.min(1, (p - start) / (end - start)) * 0.8
        }
        return (
          <span key={i} style={{ opacity }}>
            {char === ' ' ? ' ' : char}
          </span>
        )
      })}
    </div>
  )
}
