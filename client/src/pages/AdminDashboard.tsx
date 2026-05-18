import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../hooks/useLanguage'
import { FileText, Image, FolderOpen, Video, Award, GitBranch, Briefcase, Mail, LogOut, ArrowLeft, Upload, Trash2, Save, Plus, X, Menu, CheckCircle, AlertCircle } from 'lucide-react'
import LanguageSwitch from '../components/LanguageSwitch'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(c => {
  const token = localStorage.getItem('admin_token')
  if (token) c.headers.Authorization = `Bearer ${token}`
  return c
})
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin'
    }
    return Promise.reject(err)
  }
)

type Section = 'content' | 'services' | 'images' | 'projects' | 'featured' | 'videos' | 'awards' | 'skills' | 'cases' | 'settings'
type ToastState = { msg: string; type: 'success' | 'error' }

interface ContentItem {
  id: number
  key: string
  zh_value: string
  en_value: string
}

interface MarqueeImage {
  id: number
  image_url: string
  row_number: number
  sort_order: number
}

interface ProjectItem {
  id?: number
  title_zh: string
  title_en: string
  description_zh?: string
  description_en?: string
  category: string
  cover_image: string
  images: string[] | string
  sort_order: number
  is_featured: number | boolean
  video_url?: string
  video_ratio?: string
  video_file?: string
}

interface ServiceRecord {
  id?: number
  num: string
  name_zh: string
  name_en: string
  desc_zh: string
  desc_en: string
  sort_order: number
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
    if (typeof parsed === 'string' && parsed.length > 0) return [parsed]
  } catch {
    return value ? [value] : []
  }
  return []
}

const sections = [
  { key: 'content' as Section, labelZh: '内容管理', labelEn: 'Content', icon: FileText },
  { key: 'services' as Section, labelZh: '项目经历', labelEn: 'Experience', icon: Briefcase },
  { key: 'images' as Section, labelZh: '图片上传', labelEn: 'Images', icon: Image },
  { key: 'projects' as Section, labelZh: '图片作品', labelEn: 'Image Works', icon: FolderOpen },
  { key: 'featured' as Section, labelZh: '精选作品', labelEn: 'Featured', icon: Award },
  { key: 'videos' as Section, labelZh: '视频管理', labelEn: 'Videos', icon: Video },
  { key: 'awards' as Section, labelZh: '奖项管理', labelEn: 'Awards', icon: Award },
  { key: 'skills' as Section, labelZh: '技能管理', labelEn: 'Skills', icon: GitBranch },
  { key: 'cases' as Section, labelZh: '商业案例', labelEn: 'Cases', icon: Briefcase },
  { key: 'settings' as Section, labelZh: '网站设置', labelEn: 'Settings', icon: Mail },
]

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm shadow-lg ${type === 'success' ? 'bg-green-900/90 text-green-300 border border-green-700' : 'bg-red-900/90 text-red-300 border border-red-700'}`}
    >
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </motion.div>
  )
}

function ContentEditor() {
  const { isZh } = useLanguage()
  const [items, setItems] = useState<ContentItem[]>([])
  const [saving, setSaving] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => {
    setLoading(true)
    api.get('/content/all')
      .then(r => setItems(r.data))
      .catch(() => setToast({ msg: isZh ? '加载失败' : 'Load failed', type: 'error' }))
      .finally(() => setLoading(false))
  }, [isZh])

  useEffect(() => { fetch() }, [fetch])

  const save = async (item: ContentItem) => {
    setSaving(item.id)
    try {
      await api.put(`/content/${item.id}`, { zh_value: item.zh_value, en_value: item.en_value })
      setToast({ msg: isZh ? '保存成功' : 'Saved!', type: 'success' })
    } catch {
      setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' })
    } finally {
      setSaving(null)
    }
    setTimeout(() => setToast(null), 2500)
  }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-6">
      <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '内容管理' : 'Content Management'}</h2>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {items.length === 0 ? (
        <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '暂无内容条目' : 'No content entries'}</p>
      ) : (
        items.map(item => (
          <div key={item.id} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
            <p className="text-[#D7E2EA]/50 text-xs uppercase tracking-widest font-mono">{item.key}</p>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs uppercase tracking-wider mb-1 block">中文</label>
              <textarea
                value={item.zh_value || ''}
                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, zh_value: e.target.value } : i))}
                className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-4 py-3 text-[#D7E2EA] text-sm outline-none focus:border-[#D7E2EA]/40 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs uppercase tracking-wider mb-1 block">English</label>
              <textarea
                value={item.en_value || ''}
                onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, en_value: e.target.value } : i))}
                className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-4 py-3 text-[#D7E2EA] text-sm outline-none focus:border-[#D7E2EA]/40 resize-none"
                rows={3}
              />
            </div>
            <button
              onClick={() => save(item)}
              disabled={saving === item.id}
              className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {saving === item.id ? (isZh ? '保存中...' : 'Saving...') : (isZh ? '保存' : 'Save')}
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function ImageManager() {
  const { isZh } = useLanguage()
  const [images, setImages] = useState<MarqueeImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadRow, setUploadRow] = useState(1)

  const fetch = useCallback(() => {
    setLoading(true)
    api.get('/marquee')
      .then(r => setImages(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', files[0])
    try {
      const res = await api.post('/upload', fd)
      await api.post('/marquee', { image_url: res.data.url, row_number: uploadRow, sort_order: images.length })
      setToast({ msg: isZh ? '上传成功！' : 'Uploaded!', type: 'success' })
      fetch()
    } catch {
      setToast({ msg: isZh ? '上传失败' : 'Upload failed', type: 'error' })
    }
    setUploading(false)
    setTimeout(() => setToast(null), 2500)
    e.target.value = ''
  }

  const handleDelete = async (img: MarqueeImage) => {
    try {
      await api.delete(`/marquee/${img.id}`)
      const filename = img.image_url.split('/').pop()
      if (filename) {
        try {
          await api.delete(`/upload/${filename}`)
        } catch {
          // The database row is already deleted; missing files should not block the UI.
        }
      }
      setToast({ msg: isZh ? '已删除' : 'Deleted', type: 'success' })
      fetch()
    } catch {
      setToast({ msg: isZh ? '删除失败' : 'Delete failed', type: 'error' })
    }
    setTimeout(() => setToast(null), 2500)
  }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-6">
      <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '图片管理' : 'Image Manager'}</h2>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="flex items-center gap-3">
        <select
          value={uploadRow}
          onChange={e => setUploadRow(parseInt(e.target.value))}
          className="bg-[#1a1a1a] border border-[#D7E2EA]/20 rounded-lg px-3 py-2.5 text-[#D7E2EA] text-sm outline-none"
        >
          <option value={1}>{isZh ? '第一行（向右滚动）' : 'Row 1 (scrolls right)'}</option>
          <option value={2}>{isZh ? '第二行（向左滚动）' : 'Row 2 (scrolls left)'}</option>
        </select>
        <label className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-5 py-3 rounded-xl text-sm transition-colors cursor-pointer w-fit">
          <Upload size={16} /> {uploading ? (isZh ? '上传中...' : 'Uploading...') : (isZh ? '上传图片' : 'Upload Image')}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {images.length === 0 ? (
        <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '暂无图片' : 'No images yet'}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group">
              <img src={img.image_url} alt="" className="w-full h-24 object-cover rounded-lg" />
              <button
                onClick={() => handleDelete(img)}
                className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} className="text-white" />
              </button>
              <p className="text-[#D7E2EA]/30 text-xs mt-1 truncate">
                {isZh ? `第${img.row_number}行` : `Row ${img.row_number}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ImageUploadBtn({ onUploaded, label }: { onUploaded: (url: string) => void; label: string }) {
  const [up, setUp] = useState(false)
  return (
    <label className="flex items-center gap-1 text-blue-400/60 hover:text-blue-400 text-xs cursor-pointer transition-colors">
      <Upload size={10} />
      {up ? '...' : label}
      <input type="file" accept="image/*" className="hidden" onChange={async e => {
        const f = e.target.files?.[0]
        if (!f) return
        setUp(true)
        const fd = new FormData()
        fd.append('image', f)
        try {
          const res = await api.post('/upload', fd)
          onUploaded(res.data.url)
        } catch {
          // Parent form handles the final validation/save feedback.
        }
        setUp(false)
        e.target.value = ''
      }} />
    </label>
  )
}

function ProjectManager({ featured }: { featured?: boolean }) {
  const { isZh } = useLanguage()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [editing, setEditing] = useState<ProjectItem | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)
  const showFeatured = featured === undefined ? undefined : (featured ? 1 : 0)

  const fetch = useCallback(() => {
    setLoading(true)
    api.get('/projects')
      .then(r => {
        const all = r.data
        setProjects(showFeatured !== undefined ? all.filter((p: ProjectItem) => p.is_featured === showFeatured) : all)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [showFeatured])

  useEffect(() => { fetch() }, [fetch])

  const handleSave = async () => {
    if (!editing) return
    try {
      const imagesArr = Array.isArray(editing.images) ? editing.images : []
      const payload = { ...editing, images: imagesArr }
      if (editing.id) {
        await api.put(`/projects/${editing.id}`, payload)
      } else {
        await api.post('/projects', payload)
      }
      setToast({ msg: isZh ? '保存成功' : 'Saved!', type: 'success' })
      setEditing(null)
      fetch()
    } catch {
      setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' })
    }
    setTimeout(() => setToast(null), 2500)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/projects/${id}`)
      setToast({ msg: isZh ? '已删除' : 'Deleted', type: 'success' })
      fetch()
    } catch {
      setToast({ msg: isZh ? '删除失败' : 'Delete failed', type: 'error' })
    }
    setTimeout(() => setToast(null), 2500)
  }

  const ensureImages = () => {
    if (!editing) return
    const imgs = Array.isArray(editing.images) ? [...editing.images] : []
    while (imgs.length < 3) imgs.push('')
    setEditing({ ...editing, images: imgs.slice(0, 3) })
  }

  const updateImage = (idx: number, url: string) => {
    if (!editing) return
    const imgs = Array.isArray(editing.images) ? [...editing.images] : []
    imgs[idx] = url
    setEditing({ ...editing, images: imgs })
  }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '作品管理' : 'Project Manager'}</h2>
        <button onClick={() => setEditing({ title_zh: '', title_en: '', description_zh: '', description_en: '', category: '', cover_image: '', images: [], sort_order: projects.length, is_featured: 0, video_url: '', video_ratio: '16:9' })} className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> {isZh ? '新增' : 'Add'}
        </button>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">Title (中文)</label>
              <input value={editing.title_zh} onChange={e => setEditing({ ...editing, title_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
            </div>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">Title (EN)</label>
              <input value={editing.title_en} onChange={e => setEditing({ ...editing, title_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
            </div>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">Category</label>
              <input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
            </div>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">Cover Image URL</label>
              <div className="flex items-center gap-2">
                <input value={editing.cover_image} onChange={e => setEditing({ ...editing, cover_image: e.target.value })} className="flex-1 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
                <ImageUploadBtn onUploaded={url => setEditing({ ...editing, cover_image: url })} label={isZh ? '上传' : 'Up'} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '图片作品介绍（中文）' : 'Image Work Intro (ZH)'}</label>
              <textarea value={editing.description_zh || ''} onChange={e => setEditing({ ...editing, description_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={3} />
            </div>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '图片作品介绍（英文）' : 'Image Work Intro (EN)'}</label>
              <textarea value={editing.description_en || ''} onChange={e => setEditing({ ...editing, description_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={3} />
            </div>
          </div>

          {/* Gallery images for featured display */}
          <div className="border-t border-[#D7E2EA]/10 pt-3">
            <p className="text-[#D7E2EA]/40 text-xs mb-2">{isZh ? '精选展示图片（左小图2张+右大图1张）' : 'Featured display images (2 left + 1 right)'}</p>
            {!Array.isArray(editing.images) || editing.images.length === 0 ? (
              <button onClick={ensureImages} className="text-blue-400/60 hover:text-blue-400 text-xs">{isZh ? '+ 添加图片' : '+ Add images'}</button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(editing.images as string[]).slice(0, 3).map((url, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-20 bg-[#0C0C0C] rounded-lg border border-[#D7E2EA]/10 flex items-center justify-center overflow-hidden">
                      {url ? (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#D7E2EA]/20 text-xs">{isZh ? '图片' : 'Img'} {i + 1}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <input value={url} onChange={e => updateImage(i, e.target.value)} placeholder={isZh ? `图片${i+1} URL` : `Image ${i+1} URL`} className="flex-1 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded px-2 py-1 text-[#D7E2EA] text-xs outline-none" />
                      <ImageUploadBtn onUploaded={u => updateImage(i, u)} label="" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '视频链接（B站/抖音/小红书URL，可选）' : 'Video URL (Bilibili/Douyin/RED, optional)'}</label>
            <input value={editing.video_url || ''} onChange={e => setEditing({ ...editing, video_url: e.target.value })} placeholder="https://..." className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
          </div>
          <div>
            <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '或上传视频文件（MP4，私密展示）' : 'Or upload video file (MP4, private)'}</label>
            <div className="flex items-center gap-2">
              <input value={editing.video_file || ''} onChange={e => setEditing({ ...editing, video_file: e.target.value })} placeholder="/uploads/video.mp4" className="flex-1 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
              <label className="flex items-center gap-1 text-blue-400/60 hover:text-blue-400 text-xs cursor-pointer transition-colors">
                <Upload size={10} />
                {isZh ? '上传MP4' : 'Upload'}
                <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return
                  const fd = new FormData(); fd.append('image', f)
                  try {
                    const res = await api.post('/upload', fd)
                    setEditing((prev: any) => prev ? { ...prev, video_file: res.data.url } : prev)
                  } catch {}
                  e.target.value = ''
                }} />
              </label>
            </div>
            <p className="text-[#D7E2EA]/20 text-xs mt-1">{isZh ? '上传后优先使用此文件播放，不上传任何平台' : 'Uploaded file plays natively, no third-party platform'}</p>
          </div>
          <div>
            <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '视频比例' : 'Video Ratio'}</label>
            <select value={editing.video_ratio || '16:9'} onChange={e => setEditing({ ...editing, video_ratio: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none">
              <option value="16:9">16:9 横屏</option>
              <option value="9:16">9:16 竖屏（卡片内4:3展示）</option>
            </select>
          </div>
          <label className="flex items-center gap-1 text-[#D7E2EA]/40 text-xs">
            <input type="checkbox" checked={!!editing.is_featured} onChange={e => setEditing({ ...editing, is_featured: e.target.checked ? 1 : 0 })} />
            {isZh ? '精选作品（显示在首页精选区）' : 'Featured (show on homepage)'}
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm"><Save size={14} /> {isZh ? '保存' : 'Save'}</button>
            <button onClick={() => setEditing(null)} className="flex items-center gap-1 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><X size={14} /> {isZh ? '取消' : 'Cancel'}</button>
          </div>
        </motion.div>
      )}

      {projects.length === 0 ? (
        <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '暂无作品' : 'No projects yet'}</p>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={p.cover_image || 'https://picsum.photos/100/75'} alt="" className="w-16 h-12 object-cover rounded-lg" />
                <div>
                  <p className="text-[#D7E2EA] text-sm font-medium">{p.title_zh} / {p.title_en}</p>
                  <p className="text-[#D7E2EA]/40 text-xs">{p.category} {p.is_featured ? '★ Featured' : ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing({ ...p, images: parseStringArray(p.images), video_ratio: p.video_ratio || '16:9' })} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] text-sm">{isZh ? '编辑' : 'Edit'}</button>
                <button onClick={() => p.id && handleDelete(p.id)} className="text-red-400/60 hover:text-red-400 text-sm">{isZh ? '删除' : 'Del'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SiteSettings() {
  const { isZh } = useLanguage()
  const [email, setEmail] = useState('')
  const [wechat, setWechat] = useState('')
  const [portraitUrl, setPortraitUrl] = useState('')
  const [portraitId, setPortraitId] = useState<number | null>(null)
  const [uploadingPortrait, setUploadingPortrait] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/contact'),
      api.get('/content/all'),
    ]).then(([contactRes, contentRes]) => {
      setEmail(contactRes.data.email)
      setWechat(contactRes.data.wechat)
      const items: ContentItem[] = contentRes.data
      const portrait = items.find(i => i.key === 'portrait_image')
      if (portrait) {
        setPortraitUrl(portrait.zh_value)
        setPortraitId(portrait.id)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const saveContact = async () => {
    try {
      await api.put('/contact', { email, wechat })
      setToast({ msg: isZh ? '联系方式已保存' : 'Contact saved!', type: 'success' })
    } catch {
      setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' })
    }
    setTimeout(() => setToast(null), 2500)
  }

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploadingPortrait(true)
    const fd = new FormData()
    fd.append('image', files[0])
    try {
      const res = await api.post('/upload', fd)
      const url = res.data.url
      setPortraitUrl(url)
      if (portraitId) {
        await api.put(`/content/${portraitId}`, { zh_value: url, en_value: url })
      }
      setToast({ msg: isZh ? '头像已更新！刷新首页查看' : 'Portrait updated! Refresh homepage.', type: 'success' })
    } catch {
      setToast({ msg: isZh ? '上传失败' : 'Upload failed', type: 'error' })
    }
    setUploadingPortrait(false)
    setTimeout(() => setToast(null), 3000)
    e.target.value = ''
  }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-8">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Portrait Photo */}
      <div>
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider mb-4">{isZh ? '个人形象照' : 'Portrait Photo'}</h2>
        <div className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={portraitUrl || 'https://picsum.photos/seed/portrait/200/240'}
              alt="Portrait"
              className="w-24 h-28 object-cover rounded-xl border border-[#D7E2EA]/10"
            />
            <div className="space-y-2">
              <p className="text-[#D7E2EA]/40 text-xs">{isZh ? '首页英雄区中央展示' : 'Displayed in hero section center'}</p>
              <label className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer w-fit">
                <Upload size={14} /> {uploadingPortrait ? (isZh ? '上传中...' : 'Uploading...') : (isZh ? '更换照片' : 'Change Photo')}
                <input type="file" accept="image/*" onChange={handlePortraitUpload} className="hidden" />
              </label>
              <p className="text-[#D7E2EA]/20 text-xs">{isZh ? '推荐PNG透明底，宽≥520px' : 'PNG recommended, min 520px wide'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resume */}
      <div>
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider mb-4">{isZh ? '个人简历' : 'Resume'}</h2>
        <div className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
          <p className="text-[#D7E2EA]/40 text-xs">{isZh ? '上传PDF格式简历，访客点击你的名字即可全屏预览' : 'Upload PDF resume. Visitors click your name to preview.'}</p>
          <label className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer w-fit">
            <Upload size={14} /> {isZh ? '上传简历 PDF' : 'Upload Resume PDF'}
            <input type="file" accept=".pdf" className="hidden" onChange={async e => {
              const f = e.target.files?.[0]; if (!f) return
              const fd = new FormData(); fd.append('image', f)
              try {
                const res = await api.post('/upload', fd)
                const contentRes = await api.get('/content/all')
                const items: ContentItem[] = contentRes.data
                const resume = items.find(i => i.key === 'resume_pdf')
                if (resume) await api.put(`/content/${resume.id}`, { zh_value: res.data.url, en_value: res.data.url })
                setToast({ msg: isZh ? '简历已上传！' : 'Resume uploaded!', type: 'success' })
              } catch { setToast({ msg: isZh ? '上传失败' : 'Upload failed', type: 'error' }) }
              setTimeout(() => setToast(null), 3000)
              e.target.value = ''
            }} />
          </label>
        </div>
      </div>

      {/* About Corner Images */}
      <CornerImages />

      {/* Contact Info */}
      <div>
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider mb-4">{isZh ? '联系方式' : 'Contact Info'}</h2>
        <div className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-4">
          <div>
            <label className="text-[#D7E2EA]/40 text-xs uppercase tracking-wider mb-1 block">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-4 py-3 text-[#D7E2EA] text-sm outline-none" />
          </div>
          <div>
            <label className="text-[#D7E2EA]/40 text-xs uppercase tracking-wider mb-1 block">WeChat</label>
            <input value={wechat} onChange={e => setWechat(e.target.value)} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-4 py-3 text-[#D7E2EA] text-sm outline-none" />
          </div>
          <button onClick={saveContact} className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm">
            <Save size={14} /> {isZh ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoEditor() {
  const { isZh } = useLanguage()
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => { api.get('/videos').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])
  useEffect(() => { fetch() }, [fetch])

  const save = async () => {
    if (!editing) return
    try {
      if (editing.id) await api.put(`/videos/${editing.id}`, editing)
      else await api.post('/videos', editing)
      setToast({ msg: isZh ? '保存成功' : 'Saved!', type: 'success' })
      setEditing(null); fetch()
    } catch { setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' }) }
    setTimeout(() => setToast(null), 2500)
  }

  const del = async (id: number) => { await api.delete(`/videos/${id}`); fetch() }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '视频管理' : 'Video Manager'}</h2>
        <button onClick={() => setEditing({ title_zh: '', title_en: '', bilibili_url: '', thumbnail: '', duration: '', category: '', video_file: '', sort_order: items.length })} className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><Plus size={16} /> {isZh ? '新增' : 'Add'}</button>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Title (中文)</label><input value={editing.title_zh} onChange={e => setEditing({ ...editing, title_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Title (EN)</label><input value={editing.title_en} onChange={e => setEditing({ ...editing, title_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Category</label><input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Duration</label><input value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">Cover Image</label>
              <div className="flex items-center gap-2">
                <input value={editing.thumbnail} onChange={e => setEditing({ ...editing, thumbnail: e.target.value })} className="flex-1 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" placeholder="URL or upload" />
                <ImageUploadBtn onUploaded={url => setEditing((prev: any) => prev ? { ...prev, thumbnail: url } : prev)} label="" />
              </div>
            </div>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '视频文件（MP4，私密展示，优先使用）' : 'Video File (MP4, private, preferred)'}</label>
              <div className="flex items-center gap-2">
                <input value={editing.video_file || ''} onChange={e => setEditing({ ...editing, video_file: e.target.value })} className="flex-1 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" placeholder="/uploads/video.mp4" />
                <label className="flex items-center gap-1 text-blue-400/60 hover:text-blue-400 text-xs cursor-pointer">
                  <Upload size={10} /> MP4
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={async e => {
                    const f = e.target.files?.[0]; if (!f) return
                    const fd = new FormData(); fd.append('image', f)
                    try { const res = await api.post('/upload', fd); setEditing((prev: any) => prev ? { ...prev, video_file: res.data.url } : prev) } catch {}
                    e.target.value = ''
                  }} />
                </label>
              </div>
            </div>
            <div>
              <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '或粘贴外部链接（B站/抖音等）' : 'Or paste external URL (Bilibili etc.)'}</label>
              <input value={editing.bilibili_url} onChange={e => setEditing({ ...editing, bilibili_url: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2"><button onClick={save} className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm"><Save size={14} /> {isZh ? '保存' : 'Save'}</button><button onClick={() => setEditing(null)} className="flex items-center gap-1 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><X size={14} /> {isZh ? '取消' : 'Cancel'}</button></div>
        </motion.div>
      )}
      {items.map(v => (
        <div key={v.id} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-4 flex items-center justify-between">
          <div><p className="text-[#D7E2EA] text-sm font-medium">{v.title_zh} / {v.title_en}</p><p className="text-[#D7E2EA]/40 text-xs">{v.category} · {v.duration}</p></div>
          <div className="flex gap-2"><button onClick={() => setEditing(v)} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] text-sm">{isZh ? '编辑' : 'Edit'}</button><button onClick={() => del(v.id)} className="text-red-400/60 hover:text-red-400 text-sm">{isZh ? '删除' : 'Del'}</button></div>
        </div>
      ))}
    </div>
  )
}

function AwardsEditor() {
  const { isZh } = useLanguage()
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => { api.get('/awards').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])
  useEffect(() => { fetch() }, [fetch])

  const save = async () => {
    if (!editing) return
    try {
      if (editing.id) await api.put(`/awards/${editing.id}`, editing)
      else await api.post('/awards', editing)
      setToast({ msg: isZh ? '保存成功' : 'Saved!', type: 'success' })
      setEditing(null); fetch()
    } catch { setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' }) }
    setTimeout(() => setToast(null), 2500)
  }

  const del = async (id: number) => { await api.delete(`/awards/${id}`); fetch() }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '奖项管理' : 'Awards Manager'}</h2>
        <button onClick={() => setEditing({ name_zh: '', name_en: '', organization_zh: '', organization_en: '', year: new Date().getFullYear(), project_url: '', image_url: '', sort_order: items.length })} className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><Plus size={16} /> {isZh ? '新增' : 'Add'}</button>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Name (中文)</label><input value={editing.name_zh} onChange={e => setEditing({ ...editing, name_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Name (EN)</label><input value={editing.name_en} onChange={e => setEditing({ ...editing, name_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Organization (中文)</label><input value={editing.organization_zh} onChange={e => setEditing({ ...editing, organization_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Organization (EN)</label><input value={editing.organization_en} onChange={e => setEditing({ ...editing, organization_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Year</label><input type="number" value={editing.year} onChange={e => setEditing({ ...editing, year: parseInt(e.target.value) || 2024 })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Project URL</label><input value={editing.project_url} onChange={e => setEditing({ ...editing, project_url: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div className="col-span-2"><label className="text-[#D7E2EA]/40 text-xs block mb-1">Image URL</label><div className="flex items-center gap-2"><input value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} className="flex-1 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /><ImageUploadBtn onUploaded={url => setEditing({ ...editing, image_url: url })} label="" /></div></div>
          </div>
          <div className="flex gap-2"><button onClick={save} className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm"><Save size={14} /> {isZh ? '保存' : 'Save'}</button><button onClick={() => setEditing(null)} className="flex items-center gap-1 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><X size={14} /> {isZh ? '取消' : 'Cancel'}</button></div>
        </motion.div>
      )}
      {items.map(a => (
        <div key={a.id} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-4 flex items-center justify-between">
          <div><p className="text-[#D7E2EA] text-sm font-medium">{a.name_zh} / {a.name_en}</p><p className="text-[#D7E2EA]/40 text-xs">{a.organization_zh} · {a.year}</p></div>
          <div className="flex gap-2"><button onClick={() => setEditing(a)} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] text-sm">{isZh ? '编辑' : 'Edit'}</button><button onClick={() => del(a.id)} className="text-red-400/60 hover:text-red-400 text-sm">{isZh ? '删除' : 'Del'}</button></div>
        </div>
      ))}
    </div>
  )
}

function SkillsEditor() {
  const { isZh } = useLanguage()
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => { api.get('/skills').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])
  useEffect(() => { fetch() }, [fetch])

  const save = async () => {
    if (!editing) return
    try {
      if (editing.id) await api.put(`/skills/${editing.id}`, editing)
      else await api.post('/skills', editing)
      setToast({ msg: isZh ? '保存成功' : 'Saved!', type: 'success' })
      setEditing(null); fetch()
    } catch { setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' }) }
    setTimeout(() => setToast(null), 2500)
  }

  const del = async (id: number) => { await api.delete(`/skills/${id}`); fetch() }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  const rootSkills = items.filter(s => !s.parent_id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '技能管理' : 'Skills Manager'}</h2>
        <button onClick={() => setEditing({ name_zh: '', name_en: '', category: '', proficiency: 80, description_zh: '', description_en: '', parent_id: null, sort_order: items.length })} className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><Plus size={16} /> {isZh ? '新增' : 'Add'}</button>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Name (中文)</label><input value={editing.name_zh} onChange={e => setEditing({ ...editing, name_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Name (EN)</label><input value={editing.name_en} onChange={e => setEditing({ ...editing, name_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Category</label><input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Proficiency (0-100)</label><input type="number" value={editing.proficiency} onChange={e => setEditing({ ...editing, proficiency: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Parent ID (空=根节点)</label><input type="number" value={editing.parent_id || ''} onChange={e => setEditing({ ...editing, parent_id: e.target.value ? parseInt(e.target.value) : null })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Description (中文)</label><textarea value={editing.description_zh} onChange={e => setEditing({ ...editing, description_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={2} /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Description (EN)</label><textarea value={editing.description_en} onChange={e => setEditing({ ...editing, description_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={2} /></div>
          </div>
          <div className="flex gap-2"><button onClick={save} className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm"><Save size={14} /> {isZh ? '保存' : 'Save'}</button><button onClick={() => setEditing(null)} className="flex items-center gap-1 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><X size={14} /> {isZh ? '取消' : 'Cancel'}</button></div>
        </motion.div>
      )}
      {rootSkills.map(s => {
        const children = items.filter(c => c.parent_id === s.id)
        return (
          <div key={s.id} className="space-y-1">
            <div className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-4 flex items-center justify-between">
              <div><p className="text-[#D7E2EA] text-sm font-medium">{s.name_zh} / {s.name_en}</p><p className="text-[#D7E2EA]/40 text-xs">{s.category} · {s.proficiency}%</p></div>
              <div className="flex gap-2"><button onClick={() => setEditing(s)} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] text-sm">{isZh ? '编辑' : 'Edit'}</button><button onClick={() => del(s.id)} className="text-red-400/60 hover:text-red-400 text-sm">{isZh ? '删除' : 'Del'}</button></div>
            </div>
            {children.map(c => (
              <div key={c.id} className="bg-[#1a1a1a]/50 border border-[#D7E2EA]/5 rounded-xl p-3 ml-4 flex items-center justify-between">
                <div><p className="text-[#D7E2EA]/70 text-sm">{c.name_zh} / {c.name_en}</p><p className="text-[#D7E2EA]/30 text-xs">{c.proficiency}%</p></div>
                <div className="flex gap-2"><button onClick={() => setEditing(c)} className="text-[#D7E2EA]/40 hover:text-[#D7E2EA] text-xs">{isZh ? '编辑' : 'Edit'}</button><button onClick={() => del(c.id)} className="text-red-400/40 hover:text-red-400 text-xs">{isZh ? '删除' : 'Del'}</button></div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function CaseEditor() {
  const { isZh } = useLanguage()
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => { api.get('/case-studies').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])
  useEffect(() => { fetch() }, [fetch])

  const save = async () => {
    if (!editing) return
    try {
      if (editing.id) await api.put(`/case-studies/${editing.id}`, editing)
      else await api.post('/case-studies', editing)
      setToast({ msg: isZh ? '保存成功' : 'Saved!', type: 'success' })
      setEditing(null); fetch()
    } catch { setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' }) }
    setTimeout(() => setToast(null), 2500)
  }

  const del = async (id: number) => { await api.delete(`/case-studies/${id}`); fetch() }
  const caseImages = editing ? parseStringArray(editing.images) : []
  const updateCaseImage = (idx: number, url: string) => {
    if (!editing) return
    const images = parseStringArray(editing.images)
    images[idx] = url
    setEditing({ ...editing, images })
  }
  const addCaseImage = () => {
    if (!editing) return
    setEditing({ ...editing, images: [...parseStringArray(editing.images), ''] })
  }
  const removeCaseImage = (idx: number) => {
    if (!editing) return
    setEditing({ ...editing, images: parseStringArray(editing.images).filter((_, i) => i !== idx) })
  }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '案例管理' : 'Case Manager'}</h2>
        <button onClick={() => setEditing({ title_zh: '', title_en: '', client_zh: '', client_en: '', cover_image: '', intro_zh: '', intro_en: '', process_zh: '', process_en: '', result_zh: '', result_en: '', images: [], sort_order: items.length })} className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><Plus size={16} /> {isZh ? '新增' : 'Add'}</button>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {editing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Title (中文)</label><input value={editing.title_zh} onChange={e => setEditing({ ...editing, title_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Title (EN)</label><input value={editing.title_en} onChange={e => setEditing({ ...editing, title_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Client (中文)</label><input value={editing.client_zh} onChange={e => setEditing({ ...editing, client_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Client (EN)</label><input value={editing.client_en} onChange={e => setEditing({ ...editing, client_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /></div>
            <div className="col-span-2"><label className="text-[#D7E2EA]/40 text-xs block mb-1">Cover Image</label><div className="flex items-center gap-2"><input value={editing.cover_image} onChange={e => setEditing({ ...editing, cover_image: e.target.value })} className="flex-1 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" /><ImageUploadBtn onUploaded={url => setEditing({ ...editing, cover_image: url })} label="" /></div></div>
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Description (中文)</label><textarea value={editing.description_zh || ''} onChange={e => setEditing({ ...editing, description_zh: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={2} /></div>
            <div><label className="text-[#D7E2EA]/40 text-xs block mb-1">Description (EN)</label><textarea value={editing.description_en || ''} onChange={e => setEditing({ ...editing, description_en: e.target.value })} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={2} /></div>
          </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              ['intro', isZh ? '项目背景' : 'Background'],
              ['process', isZh ? '项目过程' : 'Process'],
              ['result', isZh ? '最终成果' : 'Results'],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="text-[#D7E2EA]/40 text-xs block mb-1">{label} (中文 / EN)</label>
                <div className="grid grid-cols-2 gap-2">
                  <textarea value={editing[`${field}_zh`] || ''} onChange={e => setEditing({ ...editing, [`${field}_zh`]: e.target.value })} className="bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={2} placeholder="中文" />
                  <textarea value={editing[`${field}_en`] || ''} onChange={e => setEditing({ ...editing, [`${field}_en`]: e.target.value })} className="bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={2} placeholder="English" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#D7E2EA]/10 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[#D7E2EA]/40 text-xs uppercase tracking-wider">{isZh ? '案例素材图片' : 'Case Assets'}</p>
              <button onClick={addCaseImage} className="text-blue-400/60 hover:text-blue-400 text-xs flex items-center gap-1"><Plus size={12} /> {isZh ? '添加素材' : 'Add Asset'}</button>
            </div>
            {caseImages.length === 0 ? (
              <p className="text-[#D7E2EA]/25 text-xs">{isZh ? '暂无素材，添加后会同步到商业案例风琴页。' : 'No assets yet. Added assets appear in the accordion page.'}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {caseImages.map((url, i) => (
                  <div key={i} className="bg-[#0C0C0C] border border-[#D7E2EA]/10 rounded-lg p-3 space-y-2">
                    <div className="h-28 rounded-md overflow-hidden bg-black">
                      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[#D7E2EA]/20 text-xs">{isZh ? '素材图片' : 'Asset Image'}</div>}
                    </div>
                    <div className="flex gap-2">
                      <input value={url} onChange={e => updateCaseImage(i, e.target.value)} className="flex-1 bg-[#111] border border-[#D7E2EA]/20 rounded px-2 py-1 text-[#D7E2EA] text-xs outline-none" />
                      <ImageUploadBtn onUploaded={u => updateCaseImage(i, u)} label="" />
                      <button onClick={() => removeCaseImage(i)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2"><button onClick={save} className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm"><Save size={14} /> {isZh ? '保存' : 'Save'}</button><button onClick={() => setEditing(null)} className="flex items-center gap-1 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><X size={14} /> {isZh ? '取消' : 'Cancel'}</button></div>
        </motion.div>
      )}
      {items.map(c => (
        <div key={c.id} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><img src={c.cover_image || 'https://picsum.photos/80/60'} alt="" className="w-16 h-12 object-cover rounded-lg" /><div><p className="text-[#D7E2EA] text-sm font-medium">{c.title_zh} / {c.title_en}</p><p className="text-[#D7E2EA]/40 text-xs">{c.client_zh}</p></div></div>
          <div className="flex gap-2"><button onClick={() => setEditing({ ...c, images: parseStringArray(c.images) })} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] text-sm">{isZh ? '编辑' : 'Edit'}</button><button onClick={() => del(c.id)} className="text-red-400/60 hover:text-red-400 text-sm">{isZh ? '删除' : 'Del'}</button></div>
        </div>
      ))}
    </div>
  )
}

function ServicesEditor() {
  const { isZh } = useLanguage()
  const [rows, setRows] = useState<ServiceRecord[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchServices = useCallback(() => {
    setLoading(true)
    api.get('/services')
      .then(r => setRows(r.data))
      .catch(() => setToast({ msg: isZh ? '加载失败' : 'Load failed', type: 'error' }))
      .finally(() => setLoading(false))
  }, [isZh])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const updateRow = (idx: number, field: keyof ServiceRecord, value: string | number) => {
    setRows(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const addRow = () => {
    setRows(prev => [...prev, {
      num: String(prev.length + 1).padStart(2, '0'),
      name_zh: '',
      name_en: '',
      desc_zh: '',
      desc_en: '',
      sort_order: prev.length,
    }])
  }

  const removeRow = async (idx: number) => {
    const item = rows[idx]
    if (!item?.id) {
      setRows(prev => prev.filter((_, i) => i !== idx))
      return
    }

    try {
      await api.delete(`/services/${item.id}`)
      setToast({ msg: isZh ? '已删除' : 'Deleted', type: 'success' })
      fetchServices()
    } catch {
      setToast({ msg: isZh ? '删除失败' : 'Delete failed', type: 'error' })
    }
    setTimeout(() => setToast(null), 2500)
  }

  const save = async () => {
    setSaving(true)
    try {
      await Promise.all(rows.map((row, index) => {
        const payload = { ...row, sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index }
        return row.id ? api.put(`/services/${row.id}`, payload) : api.post('/services', payload)
      }))
      setToast({ msg: isZh ? '保存成功，前端已同步读取' : 'Saved. Frontend now reads this data.', type: 'success' })
      fetchServices()
    } catch { setToast({ msg: isZh ? '保存失败' : 'Save failed', type: 'error' }) }
    setSaving(false)
    setTimeout(() => setToast(null), 2500)
  }

  if (loading) return <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider">{isZh ? '服务 / 项目经历' : 'Services / Experience'}</h2>
          <p className="text-[#D7E2EA]/40 text-xs mt-1">
            {isZh ? '这里直接管理首页白色服务区，已拆成可增删的独立条目。' : 'This directly manages the white services section on the homepage.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={addRow} className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm"><Plus size={14} /> {isZh ? '新增' : 'Add'}</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm"><Save size={14} /> {saving ? (isZh ? '保存中...' : 'Saving...') : (isZh ? '保存全部' : 'Save All')}</button>
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {rows.map((item, i) => (
        <div key={item.id || `new-${i}`} className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-end gap-3 flex-1">
              <div>
                <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '编号' : 'No.'}</label>
              <input value={item.num} onChange={e => updateRow(i, 'num', e.target.value)} className="w-20 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] font-black text-xl outline-none" />
              </div>
              <div>
                <label className="text-[#D7E2EA]/40 text-xs block mb-1">{isZh ? '排序' : 'Order'}</label>
                <input type="number" value={item.sort_order} onChange={e => updateRow(i, 'sort_order', Number(e.target.value))} className="w-24 bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
              </div>
            </div>
            <button onClick={() => removeRow(i)} className="text-red-400/60 hover:text-red-400 text-sm flex items-center gap-1"><Trash2 size={14} /> {isZh ? '删除' : 'Delete'}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[#D7E2EA]/40 text-xs block">{isZh ? '中文名称' : 'Chinese Name'}</label>
              <input value={item.name_zh} onChange={e => updateRow(i, 'name_zh', e.target.value)} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
              <label className="text-[#D7E2EA]/40 text-xs block">{isZh ? '中文描述' : 'Chinese Description'}</label>
              <textarea value={item.desc_zh} onChange={e => updateRow(i, 'desc_zh', e.target.value)} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-[#D7E2EA]/40 text-xs block">{isZh ? '英文名称' : 'English Name'}</label>
              <input value={item.name_en} onChange={e => updateRow(i, 'name_en', e.target.value)} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none" />
              <label className="text-[#D7E2EA]/40 text-xs block">{isZh ? '英文描述' : 'English Description'}</label>
              <textarea value={item.desc_en} onChange={e => updateRow(i, 'desc_en', e.target.value)} className="w-full bg-[#0C0C0C] border border-[#D7E2EA]/20 rounded-lg px-3 py-2 text-[#D7E2EA] text-sm outline-none resize-none" rows={3} />
            </div>
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '暂无项目，点击新增开始编辑' : 'No items. Click Add to start.'}</p>}
    </div>
  )
}

function CornerImages() {
  const { isZh } = useLanguage()
  const [urls, setUrls] = useState<string[]>(['','','',''])
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    api.get('/content/all').then(r => {
      const items: ContentItem[] = r.data
      setUrls([
        items.find(i => i.key === 'about_corner_1')?.zh_value || 'https://picsum.photos/seed/corner1/210/210',
        items.find(i => i.key === 'about_corner_2')?.zh_value || 'https://picsum.photos/seed/corner2/210/210',
        items.find(i => i.key === 'about_corner_3')?.zh_value || 'https://picsum.photos/seed/corner3/180/180',
        items.find(i => i.key === 'about_corner_4')?.zh_value || 'https://picsum.photos/seed/corner4/220/220',
      ])
    }).catch(() => {})
  }, [])

  const upload = async (n: number, file: File) => {
    const fd = new FormData(); fd.append('image', file)
    const res = await api.post('/upload', fd)
    const all: ContentItem[] = (await api.get('/content/all')).data
    const key = `about_corner_${n}`
    const item = all.find(i => i.key === key)
    if (item) {
      await api.put(`/content/${item.id}`, { zh_value: res.data.url, en_value: res.data.url })
      setUrls(prev => prev.map((u, i) => i === n-1 ? res.data.url : u))
      setToast({ msg: isZh ? '已更新' : 'Updated!', type: 'success' })
    }
    setTimeout(() => setToast(null), 3000)
  }

  const labels = [
    isZh ? '左上' : 'Top Left',
    isZh ? '右上' : 'Top Right',
    isZh ? '左下' : 'Bottom Left',
    isZh ? '右下' : 'Bottom Right',
  ]

  return (
    <div>
      <h2 className="text-[#D7E2EA] font-semibold text-lg uppercase tracking-wider mb-4">{isZh ? '关于我-四角装饰图' : 'About - Corner Images'}</h2>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="bg-[#1a1a1a] border border-[#D7E2EA]/10 rounded-xl p-5">
        <p className="text-[#D7E2EA]/40 text-xs mb-4">{isZh ? '首页关于我模块四个角的装饰图片' : 'Four corner decoration images in About section'}</p>
        <div className="grid grid-cols-2 gap-4">
          {urls.map((url, i) => (
            <div key={i} className="space-y-2">
              <p className="text-[#D7E2EA]/50 text-xs">{labels[i]}</p>
              <img src={url} alt="" className="w-full h-24 object-cover rounded-lg bg-[#0A0A0A]" />
              <label className="flex items-center gap-1 text-blue-400/60 hover:text-blue-400 text-xs cursor-pointer">
                <Upload size={10} />
                {isZh ? '上传替换' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return
                  try { await upload(i + 1, f) } catch { setToast({ msg: isZh ? '上传失败' : 'Upload failed', type: 'error' }) }
                  e.target.value = ''
                }} />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<Section>('content')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const SectionIcon = sections.find(s => s.key === activeSection)?.icon || FileText

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) navigate('/admin')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-60 bg-[#111] border-r border-[#D7E2EA]/10 p-5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-60'} md:translate-x-0 md:relative`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[#D7E2EA] font-semibold text-sm uppercase tracking-widest">{isZh ? '后台管理' : 'Admin Panel'}</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#D7E2EA]/60"><X size={18} /></button>
        </div>
        <nav className="flex-1 space-y-1">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => { setActiveSection(s.key); setSidebarOpen(false) }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${activeSection === s.key ? 'bg-[#D7E2EA]/15 text-[#D7E2EA]' : 'text-[#D7E2EA]/50 hover:text-[#D7E2EA] hover:bg-[#D7E2EA]/5'}`}
            >
              <s.icon size={16} />
              <span className="uppercase tracking-wider text-xs">{isZh ? s.labelZh : s.labelEn}</span>
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-[#D7E2EA]/10 space-y-2">
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#D7E2EA]/50 hover:text-[#D7E2EA] text-xs uppercase tracking-wider transition-colors w-full">
            <ArrowLeft size={14} /> {isZh ? '返回网站' : 'Back to Site'}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400/60 hover:text-red-400 text-xs uppercase tracking-wider transition-colors w-full">
            <LogOut size={14} /> {isZh ? '退出登录' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 bg-[#0C0C0C] border-b border-[#D7E2EA]/10 px-5 py-4 flex items-center gap-3 z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[#D7E2EA]/60"><Menu size={20} /></button>
          <SectionIcon size={20} className="text-[#D7E2EA]/60" />
          <span className="text-[#D7E2EA] text-sm uppercase tracking-wider">
            {isZh ? sections.find(s => s.key === activeSection)?.labelZh : sections.find(s => s.key === activeSection)?.labelEn}
          </span>
        </div>
        <div className="p-5 md:p-8 max-w-4xl">
          {activeSection === 'content' && <ContentEditor />}
          {activeSection === 'services' && <ServicesEditor />}
          {activeSection === 'images' && <ImageManager />}
          {activeSection === 'projects' && <ProjectManager featured={false} />}
          {activeSection === 'featured' && <ProjectManager featured={true} />}
          {activeSection === 'settings' && <SiteSettings />}
          {activeSection === 'videos' && <VideoEditor />}
          {activeSection === 'awards' && <AwardsEditor />}
          {activeSection === 'skills' && <SkillsEditor />}
          {activeSection === 'cases' && <CaseEditor />}
        </div>
      </div>
    </div>
  )
}
