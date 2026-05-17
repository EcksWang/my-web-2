const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { JWT_SECRET } = require('../config')

router.post('/login', (req, res) => {
  const { email, password } = req.body
  const admin = db.prepare('SELECT * FROM admin WHERE email = ?').get(email)
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, email: admin.email })
})

module.exports = router
