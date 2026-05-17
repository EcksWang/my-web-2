const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const auth = require('../auth')

const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['application/pdf', '.pdf'],
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
  ['video/quicktime', '.mov'],
])

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = allowedTypes.get(file.mimetype) || path.extname(file.originalname).toLowerCase()
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      cb(new Error('Only JPG, PNG, WebP, PDF, MP4, WebM, MOV files are allowed'))
      return
    }
    cb(null, true)
  },
})

router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  res.json({ url: '/uploads/' + req.file.filename })
})

router.delete('/:filename', auth, (req, res) => {
  const filename = path.basename(req.params.filename)
  const filePath = path.join(uploadDir, filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ success: true })
})

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err instanceof Error) {
    res.status(400).json({ error: err.message })
    return
  }
  next(err)
})

module.exports = router
