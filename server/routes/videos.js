const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM videos ORDER BY sort_order').all())
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

router.post('/', auth, (req, res) => {
  const { title_zh, title_en, description_zh, description_en, bilibili_url, thumbnail, duration, category, sort_order, video_file } = req.body
  const r = db.prepare('INSERT INTO videos (title_zh,title_en,description_zh,description_en,bilibili_url,thumbnail,duration,category,sort_order,video_file) VALUES (?,?,?,?,?,?,?,?,?,?)').run(title_zh || '', title_en || '', description_zh || '', description_en || '', bilibili_url || '', thumbnail || '', duration || '', category || '', sort_order || 0, video_file || '')
  res.json({ id: r.lastInsertRowid })
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  const f = req.body
  db.prepare('UPDATE videos SET title_zh=?,title_en=?,description_zh=?,description_en=?,bilibili_url=?,thumbnail=?,duration=?,category=?,sort_order=?,video_file=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(f.title_zh ?? row.title_zh, f.title_en ?? row.title_en, f.description_zh ?? row.description_zh, f.description_en ?? row.description_en, f.bilibili_url ?? row.bilibili_url, f.thumbnail ?? row.thumbnail, f.duration ?? row.duration, f.category ?? row.category, f.sort_order ?? row.sort_order, f.video_file ?? row.video_file ?? '', req.params.id)
  res.json({ success: true })
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
