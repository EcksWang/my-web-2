import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Mail, MessageCircle } from 'lucide-react'
import axios from 'axios'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { t } = useTranslation()
  const [contact, setContact] = useState({ email: '', wechat: '' })

  useEffect(() => {
    if (open) {
      axios.get('/api/contact').then(r => setContact(r.data)).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            className="relative bg-[#1a1a1a] border border-[#D7E2EA]/20 rounded-3xl p-8 sm:p-10 max-w-sm w-full"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-[#D7E2EA]/60 hover:text-[#D7E2EA] transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-[#D7E2EA] font-semibold text-xl uppercase tracking-wider mb-8 text-center">
              {t('common.contact')} / Contact
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#0C0C0C] rounded-2xl border border-[#D7E2EA]/10">
                <Mail size={22} className="text-[#D7E2EA] shrink-0" />
                <div>
                  <p className="text-[#D7E2EA]/50 text-xs uppercase tracking-wider mb-0.5">{t('contact.email')}</p>
                  <p className="text-[#D7E2EA] text-sm sm:text-base break-all">{contact.email || 'wh8818028666@163.com'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[#0C0C0C] rounded-2xl border border-[#D7E2EA]/10">
                <MessageCircle size={22} className="text-[#D7E2EA] shrink-0" />
                <div>
                  <p className="text-[#D7E2EA]/50 text-xs uppercase tracking-wider mb-0.5">{t('contact.wechat')}</p>
                  <p className="text-[#D7E2EA] text-sm sm:text-base">{contact.wechat || '17375061426'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
