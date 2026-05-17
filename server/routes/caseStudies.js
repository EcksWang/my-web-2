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
  res.json(db.prepare('SELECT * FROM case_studies ORDER BY sort_order').all())
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM case_studies WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

router.post('/', auth, (req, res) => {
  const f = req.body
  const r = db.prepare('INSERT INTO case_studies (title_zh,title_en,client_zh,client_en,cover_image,intro_zh,intro_en,process_zh,process_en,result_zh,result_en,images,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(f.title_zh || '', f.title_en || '', f.client_zh || '', f.client_en || '', f.cover_image || '', f.intro_zh || '', f.intro_en || '', f.process_zh || '', f.process_en || '', f.result_zh || '', f.result_en || '', normalizeImages(f.images), f.sort_order || 0)
  res.json({ id: r.lastInsertRowid })
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM case_studies WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  const f = req.body
  db.prepare('UPDATE case_studies SET title_zh=?,title_en=?,client_zh=?,client_en=?,cover_image=?,intro_zh=?,intro_en=?,process_zh=?,process_en=?,result_zh=?,result_en=?,images=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(f.title_zh ?? row.title_zh, f.title_en ?? row.title_en, f.client_zh ?? row.client_zh, f.client_en ?? row.client_en, f.cover_image ?? row.cover_image, f.intro_zh ?? row.intro_zh, f.intro_en ?? row.intro_en, f.process_zh ?? row.process_zh, f.process_en ?? row.process_en, f.result_zh ?? row.result_zh, f.result_en ?? row.result_en, f.images !== undefined ? normalizeImages(f.images) : row.images, f.sort_order ?? row.sort_order, req.params.id)
  res.json({ success: true })
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM case_studies WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
