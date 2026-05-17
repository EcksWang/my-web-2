import { useState, useRef, useEffect, type ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  margin?: number
  strength?: number
  className?: string
  centerX?: boolean
  centerY?: boolean
}

export default function Magnet({ children, margin = 150, strength = 3, className, centerX = true, centerY = true }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < margin) {
        setActive(true)
        setPos({ x: dx / strength, y: dy / strength })
      } else {
        setActive(false)
        setPos({ x: 0, y: 0 })
      }
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [margin, strength])

  const tx = centerX ? `calc(-50% + ${pos.x}px)` : `${pos.x}px`
  const ty = centerY ? `calc(-50% + ${pos.y}px)` : `${pos.y}px`

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate(${tx}, ${ty})`,
        transition: active ? 'transform 0.15s ease-out' : 'transform 0.4s ease-out',
      }}
    >
      {children}
    </div>
  )
}
