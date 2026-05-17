export function embedVideoUrl(url: string): string {
  if (!url) return ''
  if (url.includes('player.bilibili.com')) return url.includes('autoplay=') ? url : url + (url.includes('?') ? '&' : '?') + 'autoplay=1'
  const bvMatch = url.match(/BV[a-zA-Z0-9]{8,12}/)
  if (bvMatch) return `https://player.bilibili.com/player.html?bvid=${bvMatch[0]}&autoplay=1`
  const aidMatch = url.match(/av(\d+)/i)
  if (aidMatch) return `https://player.bilibili.com/player.html?aid=${aidMatch[1]}&autoplay=1`
  return url
}
