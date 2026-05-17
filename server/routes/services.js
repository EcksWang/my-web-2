const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM services ORDER BY sort_order, id').all()
  res.json(rows)
})

router.post('/', auth, (req, res) => {
  const { num, name_zh, name_en, desc_zh, desc_en, sort_order } = req.body
  const result = db.prepare(
    'INSERT INTO services (num, name_zh, name_en, desc_zh, desc_en, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(num || '', name_zh || '', name_en || '', desc_zh || '', desc_en || '', sort_order || 0)
  res.json({ id: result.lastInsertRowid })
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })

  const { num, name_zh, name_en, desc_zh, desc_en, sort_order } = req.body
  db.prepare(`
    UPDATE services
    SET num = ?, name_zh = ?, name_en = ?, desc_zh = ?, desc_en = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    num ?? row.num,
    name_zh ?? row.name_zh,
    name_en ?? row.name_en,
    desc_zh ?? row.desc_zh,
    desc_en ?? row.desc_en,
    sort_order ?? row.sort_order,
    req.params.id
  )
  res.json({ success: true })
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
