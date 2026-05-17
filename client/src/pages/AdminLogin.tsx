import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import LanguageSwitch from '../components/LanguageSwitch'
import { useLanguage } from '../hooks/useLanguage'

export default function AdminLogin() {
  const { isZh, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('admin_token', res.data.token)
      navigate('/admin/dashboard')
    } catch {
      setError(isZh ? '邮箱或密码错误' : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col">
      <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8">
        <button
          onClick={() => navigate('/')}
          className="text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={18} />
          {isZh ? '返回首页' : 'Back to Home'}
        </button>
        <LanguageSwitch isZh={isZh} onToggle={toggleLanguage} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <h1 className="hero-heading font-black uppercase text-center text-[clamp(2rem,5vw,3rem)] tracking-tighter leading-none mb-2">
            Admin
          </h1>
          <p className="text-[#D7E2EA]/50 text-center text-sm uppercase tracking-widest mb-10">
            {isZh ? '管理后台' : 'Management Panel'}
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isZh ? '管理员邮箱' : 'Admin Email'}
                className="w-full bg-[#1a1a1a] border border-[#D7E2EA]/20 rounded-xl px-5 py-4 text-[#D7E2EA] placeholder-[#D7E2EA]/30 outline-none focus:border-[#D7E2EA]/50 transition-colors text-sm"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isZh ? '密码' : 'Password'}
                className="w-full bg-[#1a1a1a] border border-[#D7E2EA]/20 rounded-xl px-5 py-4 pr-12 text-[#D7E2EA] placeholder-[#D7E2EA]/30 outline-none focus:border-[#D7E2EA]/50 transition-colors text-sm"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D7E2EA]/40 hover:text-[#D7E2EA] transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative rounded-full px-8 py-4 text-white font-medium uppercase tracking-[0.3em] text-sm overflow-hidden disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #646973, #8a9aaa)',
                boxShadow: '0 0 0 2px white, 0 0 0 5px rgba(100,105,115,0.3)',
              }}
            >
              {loading ? (isZh ? '登录中...' : 'Logging in...') : (isZh ? '登录' : 'Login')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
