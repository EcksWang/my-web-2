const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me-before-deploy'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@wanghang.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

module.exports = {
  JWT_SECRET,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
}
