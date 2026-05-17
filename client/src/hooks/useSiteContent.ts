import { useState, useEffect } from 'react'
import axios from 'axios'

type ContentMap = Record<string, { zh_value: string; en_value: string }>

export function useSiteContent() {
  const [content, setContent] = useState<ContentMap>({})

  useEffect(() => {
    axios.get('/api/content').then(r => {
      setContent(r.data)
    }).catch(() => {})
  }, [])

  const get = (key: string, lang: 'zh' | 'en', fallback: string): string => {
    const item = content[key]
    if (!item) return fallback
    return lang === 'zh' ? (item.zh_value || fallback) : (item.en_value || fallback)
  }

  const getPortrait = (): string => {
    const item = content['portrait_image']
    if (item?.zh_value) return item.zh_value
    return 'https://picsum.photos/seed/portrait/520/600'
  }

  return { content, get, getPortrait }
}
