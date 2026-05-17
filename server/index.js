const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Public routes
app.use('/api/content', require('./routes/content'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/videos', require('./routes/videos'))
app.use('/api/marquee', require('./routes/marquee'))
app.use('/api/services', require('./routes/services'))
app.use('/api/awards', require('./routes/awards'))
app.use('/api/skills', require('./routes/skills'))
app.use('/api/case-studies', require('./routes/caseStudies'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/upload', require('./routes/upload'))

// Resume: get latest PDF
app.get('/api/resume', (req, res) => {
  const db = require('./db')
  const row = db.prepare("SELECT zh_value FROM site_content WHERE key = 'resume_pdf' AND zh_value != ''").get()
  if (row) {
    const filePath = path.join(__dirname, 'uploads', path.basename(row.zh_value))
    const fs = require('fs')
    if (fs.existsSync(filePath)) return res.sendFile(filePath)
  }
  res.status(404).json({ error: 'No resume uploaded' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
