import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, AlertCircle } from 'lucide-react'
import LanguageSwitch from '../components/LanguageSwitch'
import { useLanguage } from '../hooks/useLanguage'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Resume() {
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const [hasResume, setHasResume] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    axios.head('/api/resume').then(() => setHasResume(true)).catch(() => setHasResume(false)).finally(() => setChecking(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col">
      <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 pb-4">
        <button onClick={() => navigate('/')} className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider">
          <ArrowLeft size={18} /> {isZh ? '返回首页' : 'Back to Home'}
        </button>
        <div className="flex items-center gap-6">
          {hasResume && (
            <a
              href="/api/resume"
              download="简历_WangHang.pdf"
              className="flex items-center gap-2 bg-[#D7E2EA]/10 hover:bg-[#D7E2EA]/20 text-[#D7E2EA] px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Download size={16} /> {isZh ? '下载' : 'Download'}
            </a>
          )}
          <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {checking ? (
          <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '加载中...' : 'Loading...'}</p>
        ) : hasResume ? (
          <iframe
            src="/api/resume"
            className="w-full h-[calc(100vh-100px)] rounded-2xl border border-[#D7E2EA]/10"
            title="Resume"
          />
        ) : (
          <div className="text-center space-y-3">
            <AlertCircle size={40} className="text-[#D7E2EA]/20 mx-auto" />
            <p className="text-[#D7E2EA]/40 text-sm">{isZh ? '暂无简历，请先上传' : 'No resume uploaded yet'}</p>
            <p className="text-[#D7E2EA]/20 text-xs">{isZh ? '前往后台 网站设置 → 上传简历' : 'Go to admin Settings → Upload Resume'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
