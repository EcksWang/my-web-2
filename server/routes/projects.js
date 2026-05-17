const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

function normalizeImages(value) {
  if (Array.isArray(value)) return JSON.stringify(value.filter(item => typeof item === 'string' && item.length > 0))
  if (typeof value !== 'string') return '[]'

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(item => typeof item === 'string' && item.length > 0))
    if (typeof parsed === 'string' && parsed.length > 0) return JSON.stringify([parsed])
  } catch {
    if (value.length > 0) return JSON.stringify([value])
  }

  return '[]'
}

router.get('/', (req, res) => {
  let rows
  if (req.query.featured === 'true') {
    rows = db.prepare('SELECT * FROM projects WHERE is_featured = 1 ORDER BY sort_order').all()
  } else {
    rows = db.prepare('SELECT * FROM projects ORDER BY sort_order').all()
  }
  res.json(rows)
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

router.post('/', auth, (req, res) => {
  const { title_zh, title_en, description_zh, description_en, category, cover_image, images, sort_order, is_featured, video_url, video_ratio, video_file } = req.body
  const result = db.prepare('INSERT INTO projects (title_zh, title_en, description_zh, description_en, category, cover_image, images, sort_order, is_featured, video_url, video_ratio, video_file) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(title_zh || '', title_en || '', description_zh || '', description_en || '', category || '', cover_image || '', normalizeImages(images), sort_order || 0, is_featured ? 1 : 0, video_url || '', video_ratio === '9:16' ? '9:16' : '16:9', video_file || '')
  res.json({ id: result.lastInsertRowid })
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  const { title_zh, title_en, description_zh, description_en, category, cover_image, images, sort_order, is_featured, video_url, video_ratio, video_file } = req.body
  db.prepare('UPDATE projects SET title_zh=?,title_en=?,description_zh=?,description_en=?,category=?,cover_image=?,images=?,sort_order=?,is_featured=?,video_url=?,video_ratio=?,video_file=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(title_zh ?? row.title_zh, title_en ?? row.title_en, description_zh ?? row.description_zh, description_en ?? row.description_en, category ?? row.category, cover_image ?? row.cover_image, images !== undefined ? normalizeImages(images) : row.images, sort_order ?? row.sort_order, is_featured !== undefined ? (is_featured ? 1 : 0) : row.is_featured, video_url ?? row.video_url ?? '', video_ratio === '9:16' ? '9:16' : (row.video_ratio || '16:9'), video_file ?? row.video_file ?? '', req.params.id)
  res.json({ success: true })
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
