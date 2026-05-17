const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./config')

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET)
    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = auth
