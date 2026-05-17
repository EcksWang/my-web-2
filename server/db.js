const Database = require('better-sqlite3')
const path = require('path')
const bcrypt = require('bcryptjs')
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('./config')

const db = new Database(path.join(__dirname, 'portfolio.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    zh_value TEXT NOT NULL DEFAULT '',
    en_value TEXT NOT NULL DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

	  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_zh TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL DEFAULT '',
    description_zh TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    category TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    images TEXT DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
	    is_featured INTEGER DEFAULT 0,
	    video_url TEXT DEFAULT '',
	    video_ratio TEXT DEFAULT '16:9',
	    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	  );

  CREATE TABLE IF NOT EXISTS marquee_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL DEFAULT '',
    row_number INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_zh TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL DEFAULT '',
    description_zh TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    bilibili_url TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    category TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS awards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_zh TEXT NOT NULL DEFAULT '',
    name_en TEXT NOT NULL DEFAULT '',
    organization_zh TEXT DEFAULT '',
    organization_en TEXT DEFAULT '',
    year INTEGER DEFAULT 2024,
    project_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_zh TEXT NOT NULL DEFAULT '',
    name_en TEXT NOT NULL DEFAULT '',
    category TEXT DEFAULT '',
    proficiency INTEGER DEFAULT 80,
    description_zh TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    parent_id INTEGER DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS case_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_zh TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL DEFAULT '',
    client_zh TEXT DEFAULT '',
    client_en TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    intro_zh TEXT DEFAULT '',
    intro_en TEXT DEFAULT '',
    process_zh TEXT DEFAULT '',
    process_en TEXT DEFAULT '',
    result_zh TEXT DEFAULT '',
    result_en TEXT DEFAULT '',
    images TEXT DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT DEFAULT '',
    wechat TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    num TEXT DEFAULT '',
    name_zh TEXT NOT NULL DEFAULT '',
    name_en TEXT NOT NULL DEFAULT '',
    desc_zh TEXT DEFAULT '',
    desc_en TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

function ensureColumn(table, column, definition) {
  const exists = db.prepare(`PRAGMA table_info(${table})`).all().some(col => col.name === column)
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
}

ensureColumn('projects', 'video_url', "TEXT DEFAULT ''")
ensureColumn('projects', 'video_ratio', "TEXT DEFAULT '16:9'")

// Seed default admin. Override ADMIN_EMAIL and ADMIN_PASSWORD in production.
const adminCheck = db.prepare('SELECT id FROM admin LIMIT 1').get()
if (!adminCheck) {
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  db.prepare('INSERT INTO admin (email, password_hash) VALUES (?, ?)').run(ADMIN_EMAIL, hash)
}

// Seed default contact
const contactCheck = db.prepare('SELECT id FROM contact LIMIT 1').get()
if (!contactCheck) {
  db.prepare('INSERT INTO contact (email, wechat) VALUES (?, ?)').run('wh8818028666@163.com', '17375061426')
}

// Seed site content defaults. Each key stores Chinese and English together.
const defaults = [
  {
    key: 'hero_description',
    zh: '专注于3D设计、动态影像与品牌视觉的全能创作者，用创意打造令人过目不忘的数字体验',
    en: 'A versatile creator specializing in 3D design, motion graphics, and brand visual identity — crafting unforgettable digital experiences through creativity.',
  },
  {
    key: 'about_text',
    zh: '我是汪航，一名拥有多年经验的创意视觉设计师，专注于3D建模、动态影像制作、品牌视觉设计与网页开发。我热衷于将创意转化为视觉现实，帮助品牌打造独特且有影响力的数字形象。让我们一起创造非凡！',
    en: "I'm Wang Hang, a creative visual designer with years of experience\nspecializing in 3D modeling, motion graphics, brand identity design, and web development.\n\nI'm passionate about turning ideas into visual reality, helping brands build\nunique and impactful digital presences.\n\nLet's create something extraordinary together!",
  },
  {
    key: 'portrait_image',
    zh: 'https://picsum.photos/seed/portrait/520/600',
    en: 'https://picsum.photos/seed/portrait/520/600',
  },
  {
    key: 'resume_pdf',
    zh: '',
    en: '',
  },
]

const insertContent = db.prepare('INSERT OR IGNORE INTO site_content (key, zh_value, en_value) VALUES (?, ?, ?)')
for (const item of defaults) {
  insertContent.run(item.key, item.zh, item.en)
}

const defaultServices = [
  {
    num: '01',
    name_zh: '3D设计与建模',
    name_en: '3D Design & Modeling',
    desc_zh: '创建精细的3D模型、角色与场景，适用于产品展示、游戏开发、建筑可视化等领域',
    desc_en: 'Creating detailed 3D models, characters and scenes for product showcases, game development, architectural visualization and more.',
  },
  {
    num: '02',
    name_zh: '动态影像与视频',
    name_en: 'Motion & Video',
    desc_zh: '制作高品质动态图形、产品动画、品牌宣传片与短视频，为内容注入活力与故事感',
    desc_en: 'Producing high-quality motion graphics, product animations, brand promo videos and short-form content with vitality and storytelling.',
  },
  {
    num: '03',
    name_zh: '品牌视觉设计',
    name_en: 'Brand Identity',
    desc_zh: '打造完整的品牌视觉体系，包括logo设计、VI系统、包装设计与品牌指南',
    desc_en: 'Building complete brand visual systems including logo design, VI systems, packaging design and brand guidelines.',
  },
  {
    num: '04',
    name_zh: '平面设计与插画',
    name_en: 'Graphic & Illustration',
    desc_zh: '提供海报、画册、社交媒体素材、商业插画等各类平面设计服务',
    desc_en: 'Providing posters, brochures, social media assets, commercial illustrations and all types of graphic design services.',
  },
  {
    num: '05',
    name_zh: '网页设计与开发',
    name_en: 'Web Design & Dev',
    desc_zh: '设计并开发响应式现代网站，注重用户体验与视觉美感，支持静态站与轻量交互站',
    desc_en: 'Designing and developing responsive modern websites with a focus on user experience and visual aesthetics, supporting static and interactive sites.',
  },
]

const servicesCheck = db.prepare('SELECT id FROM services LIMIT 1').get()
if (!servicesCheck) {
  const legacy = db.prepare("SELECT zh_value, en_value FROM site_content WHERE key = 'services_data'").get()
  let seedServices = defaultServices

  if (legacy) {
    try {
      const zhItems = JSON.parse(legacy.zh_value || '[]')
      const enItems = JSON.parse(legacy.en_value || '[]')
      const max = Math.max(zhItems.length, enItems.length)
      seedServices = Array.from({ length: max }, (_, i) => ({
        num: zhItems[i]?.num || enItems[i]?.num || String(i + 1).padStart(2, '0'),
        name_zh: zhItems[i]?.name || '',
        name_en: enItems[i]?.name || '',
        desc_zh: zhItems[i]?.desc || '',
        desc_en: enItems[i]?.desc || '',
      }))
    } catch {
      seedServices = defaultServices
    }
  }

  const insertService = db.prepare('INSERT INTO services (num, name_zh, name_en, desc_zh, desc_en, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
  seedServices.forEach((item, index) => {
    insertService.run(item.num, item.name_zh, item.name_en, item.desc_zh, item.desc_en, index)
  })
}

db.prepare("DELETE FROM site_content WHERE key = 'services_data'").run()

// Seed default marquee images (placeholder placeholders)
const marqueeCheck = db.prepare('SELECT id FROM marquee_images LIMIT 1').get()
if (!marqueeCheck) {
  const insertMarquee = db.prepare('INSERT INTO marquee_images (image_url, row_number, sort_order) VALUES (?, ?, ?)')
  for (let i = 0; i < 11; i++) {
    insertMarquee.run(`https://picsum.photos/420/270?random=${i}`, 1, i)
  }
  for (let i = 0; i < 10; i++) {
    insertMarquee.run(`https://picsum.photos/420/270?random=${i + 20}`, 2, i)
  }
}

module.exports = db
