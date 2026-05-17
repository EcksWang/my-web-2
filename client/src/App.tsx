import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ImageWorks from './pages/ImageWorks'
import VideoWorks from './pages/VideoWorks'
import Awards from './pages/Awards'
import SkillsTree from './pages/SkillsTree'
import CaseStudies from './pages/CaseStudies'
import Resume from './pages/Resume'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/works/images" element={<ImageWorks />} />
      <Route path="/works/videos" element={<VideoWorks />} />
      <Route path="/works/cases" element={<CaseStudies />} />
      <Route path="/works/awards" element={<Awards />} />
      <Route path="/works/skills" element={<SkillsTree />} />
      <Route path="/resume" element={<Resume />} />
    </Routes>
  )
}
