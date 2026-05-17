const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

// Get all content as array (MUST be before /:id)
router.get('/all', (req, res) => {
  const rows = db.prepare('SELECT * FROM site_content ORDER BY id').all()
  res.json(rows)
})

// Get single content by id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const row = db.prepare('SELECT * FROM site_content WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

// Get all content as key-value map (will only match exact /)
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM site_content ORDER BY id').all()
  const result = {}
  for (const row of rows) {
    result[row.key] = row
  }
  res.json(result)
})

// Update content by id (requires auth)
router.put('/:id', auth, (req, res) => {
  const { zh_value, en_value } = req.body
  const id = parseInt(req.params.id)
  const row = db.prepare('SELECT * FROM site_content WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  db.prepare('UPDATE site_content SET zh_value = ?, en_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    zh_value ?? row.zh_value, en_value ?? row.en_value, id
  )
  res.json({ success: true })
})

// Update content by key (requires auth)
router.put('/key/:key', auth, (req, res) => {
  const { zh_value, en_value } = req.body
  const row = db.prepare('SELECT * FROM site_content WHERE key = ?').get(req.params.key)
  if (!row) {
    db.prepare('INSERT INTO site_content (key, zh_value, en_value) VALUES (?, ?, ?)').run(req.params.key, zh_value || '', en_value || '')
  } else {
    db.prepare('UPDATE site_content SET zh_value = ?, en_value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(zh_value ?? row.zh_value, en_value ?? row.en_value, req.params.key)
  }
  res.json({ success: true })
})

module.exports = router
