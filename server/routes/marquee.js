const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM marquee_images ORDER BY row_number, sort_order').all()
  res.json(rows)
})

router.post('/', auth, (req, res) => {
  const { image_url, row_number, sort_order } = req.body
  const result = db.prepare('INSERT INTO marquee_images (image_url, row_number, sort_order) VALUES (?,?,?)').run(image_url || '', row_number || 1, sort_order || 0)
  res.json({ id: result.lastInsertRowid })
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM marquee_images WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  const { image_url, row_number, sort_order } = req.body
  db.prepare('UPDATE marquee_images SET image_url=?, row_number=?, sort_order=? WHERE id=?').run(image_url ?? row.image_url, row_number ?? row.row_number, sort_order ?? row.sort_order, req.params.id)
  res.json({ success: true })
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM marquee_images WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
