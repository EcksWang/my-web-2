const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM awards ORDER BY year DESC, sort_order').all())
})

router.post('/', auth, (req, res) => {
  const { name_zh, name_en, organization_zh, organization_en, year, project_url, sort_order, image_url } = req.body
  const r = db.prepare('INSERT INTO awards (name_zh,name_en,organization_zh,organization_en,year,project_url,sort_order,image_url) VALUES (?,?,?,?,?,?,?,?)').run(name_zh || '', name_en || '', organization_zh || '', organization_en || '', year || 2024, project_url || '', sort_order || 0, image_url || '')
  res.json({ id: r.lastInsertRowid })
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM awards WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  const f = req.body
  db.prepare('UPDATE awards SET name_zh=?,name_en=?,organization_zh=?,organization_en=?,year=?,project_url=?,sort_order=?,image_url=? WHERE id=?').run(f.name_zh ?? row.name_zh, f.name_en ?? row.name_en, f.organization_zh ?? row.organization_zh, f.organization_en ?? row.organization_en, f.year ?? row.year, f.project_url ?? row.project_url, f.sort_order ?? row.sort_order, f.image_url ?? row.image_url ?? '', req.params.id)
  res.json({ success: true })
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM awards WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
