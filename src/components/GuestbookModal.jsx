import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Star } from 'lucide-react'

const TAGS = [
  { label: '#推力告白', color: '#ef4444', bg: 'bg-red-900/40',    border: 'border-red-700/50'    },
  { label: '#拉力初心', color: '#3b82f6', bg: 'bg-blue-900/40',   border: 'border-blue-700/50'   },
  { label: '#引力祝福', color: '#f59e0b', bg: 'bg-amber-900/40',  border: 'border-amber-700/50'  },
  { label: '#星塵共鳴', color: '#a855f7', bg: 'bg-purple-900/40', border: 'border-purple-700/50' },
]

const TAG_COLORS = Object.fromEntries(TAGS.map(t => [t.label, t.color]))

// screenPos gives the star a stable position in the HTML overlay
const randomScreenPos = () => ({
  left: `${8 + Math.random() * 80}%`,
  top:  `${12 + Math.random() * 72}%`,
})

export default function GuestbookModal({ isOpen, onClose, onSubmit }) {
  const [selectedTag, setSelectedTag] = useState(null)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const textareaRef = useRef()
  const MAX = 50

  // Reset on open
  useEffect(() => {
    if (isOpen) { setSelectedTag(null); setText(''); setSubmitted(false) }
  }, [isOpen])

  // Focus textarea when tag selected
  useEffect(() => {
    if (selectedTag && textareaRef.current) textareaRef.current.focus()
  }, [selectedTag])

  const handleSubmit = () => {
    if (!selectedTag || !text.trim()) return
    const newMsg = {
      id: `msg-${Date.now()}`,
      text: text.trim(),
      tag: selectedTag,
      color: TAG_COLORS[selectedTag],
      screenPos: randomScreenPos(),
    }
    onSubmit(newMsg)
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); onClose() }, 2200)
  }

  const canSubmit = selectedTag && text.trim().length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="guestbook-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="relative w-full max-w-md rounded-2xl border border-slate-700/50 backdrop-blur-2xl overflow-hidden"
            style={{
              background: 'rgba(8, 12, 28, 0.90)',
              boxShadow: '0 0 60px rgba(245,158,11,0.1), 0 8px 40px rgba(0,0,0,0.7)',
            }}
          >
            {/* Top glow bar */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            <AnimatePresence mode="wait">
              {/* Success state */}
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-14 px-8 text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-4xl mb-4"
                  >
                    ✦
                  </motion.div>
                  <h3 className="text-amber-300 text-lg font-light mb-2">星訊已發射</h3>
                  <p className="text-slate-400 text-sm">你的話語正在成為星空的一部分</p>
                  <p className="text-slate-500 text-xs mt-3">在宇宙中找找你的星吧</p>
                </motion.div>
              ) : (
                /* Form state */
                <motion.div key="form" className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star size={14} className="text-amber-400" />
                        <span className="text-amber-400/80 text-xs tracking-[0.25em] uppercase">星系留言板</span>
                      </div>
                      <h2 className="text-white text-base font-light">
                        留下你的星訊
                      </h2>
                      <p className="text-slate-500 text-xs mt-1">匿名 · 50 字以內 · 成為宇宙中閃爍的一顆星</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Tag selector */}
                  <div className="mb-4">
                    <p className="text-slate-500 text-xs mb-2 tracking-wide">選擇頻道</p>
                    <div className="grid grid-cols-2 gap-2">
                      {TAGS.map(tag => (
                        <button
                          key={tag.label}
                          onClick={() => setSelectedTag(tag.label)}
                          className={`
                            py-2 px-3 rounded-lg border text-xs font-medium text-left transition-all duration-200
                            ${selectedTag === tag.label
                              ? `${tag.bg} ${tag.border}`
                              : 'border-slate-700/40 bg-slate-900/30 text-slate-500 hover:border-slate-600'}
                          `}
                          style={selectedTag === tag.label ? { color: tag.color } : {}}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <AnimatePresence>
                    {selectedTag && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4"
                      >
                        <div className="relative">
                          <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={e => setText(e.target.value.slice(0, MAX))}
                            placeholder="寫下你想對宇宙說的話……"
                            rows={3}
                            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 text-sm
                              placeholder:text-slate-600 resize-none focus:outline-none focus:border-amber-600/50 transition-colors"
                            style={{ lineHeight: 1.7 }}
                          />
                          <span className={`absolute bottom-3 right-3 text-xs ${text.length >= MAX ? 'text-red-400' : 'text-slate-600'}`}>
                            {text.length}/{MAX}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    whileTap={canSubmit ? { scale: 0.97 } : {}}
                    className={`
                      w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2
                      transition-all duration-300
                      ${canSubmit
                        ? 'bg-amber-500/20 border border-amber-500/60 text-amber-200 hover:bg-amber-500/30'
                        : 'bg-slate-900/40 border border-slate-700/30 text-slate-600 cursor-not-allowed'}
                    `}
                  >
                    <Send size={14} />
                    發射星訊至宇宙
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
