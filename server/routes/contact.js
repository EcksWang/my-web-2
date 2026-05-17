const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../auth')

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM contact LIMIT 1').get()
  res.json(row || { email: '', wechat: '' })
})

router.put('/', auth, (req, res) => {
  const { email, wechat } = req.body
  const row = db.prepare('SELECT * FROM contact LIMIT 1').get()
  if (row) {
    db.prepare('UPDATE contact SET email=?, wechat=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(email ?? row.email, wechat ?? row.wechat, row.id)
  } else {
    db.prepare('INSERT INTO contact (email, wechat) VALUES (?,?)').run(email || '', wechat || '')
  }
  res.json({ success: true })
})

module.exports = router
