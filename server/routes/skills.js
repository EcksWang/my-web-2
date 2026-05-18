const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM skills ORDER BY sort_order').all())
})

router.post('/', auth, (req, res) => {
  const { name_zh, name_en, category, proficiency, description_zh, description_en, parent_id, sort_order } = req.body
  const r = db.prepare('INSERT INTO skills (name_zh,name_en,category,proficiency,description_zh,description_en,parent_id,sort_order) VALUES (?,?,?,?,?,?,?,?)').run(name_zh || '', name_en || '', category || '', proficiency || 80, description_zh || '', description_en || '', parent_id || null, sort_order || 0)
  res.json({ id: r.lastInsertRowid })
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  const f = req.body
  db.prepare('UPDATE skills SET name_zh=?,name_en=?,category=?,proficiency=?,description_zh=?,description_en=?,parent_id=?,sort_order=? WHERE id=?').run(f.name_zh ?? row.name_zh, f.name_en ?? row.name_en, f.category ?? row.category, f.proficiency ?? row.proficiency, f.description_zh ?? row.description_zh, f.description_en ?? row.description_en, f.parent_id ?? row.parent_id, f.sort_order ?? row.sort_order, req.params.id)
  res.json({ success: true })
})

router.post('/batch', auth, (req, res) => {
  const skills = req.body
  if (!Array.isArray(skills)) return res.status(400).json({ error: 'Expected an array' })
  const stmt = db.prepare('INSERT INTO skills (name_zh,name_en,category,proficiency,description_zh,description_en,parent_id,sort_order) VALUES (?,?,?,?,?,?,?,?)')
  const insertMany = db.transaction((items) => {
    for (const s of items) {
      stmt.run(s.name_zh || '', s.name_en || '', s.category || '', s.proficiency ?? 80, s.description_zh || '', s.description_en || '', s.parent_id ?? null, s.sort_order || 0)
    }
  })
  insertMany(skills)
  res.json({ imported: skills.length })
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
