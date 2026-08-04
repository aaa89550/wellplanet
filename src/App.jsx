import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import CosmosScene from './components/CosmosScene'
import ContentOverlay from './components/ContentOverlay'
import InteractiveCards from './components/InteractiveCards'
import AudioPlayer from './components/AudioPlayer'
import GuestbookModal from './components/GuestbookModal'
import GuestbookStars from './components/GuestbookStars'
import Quiz from './components/Quiz'

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ onEnter }) {
  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'rgba(3,7,18,0.95)' }}
    >
      {/* Ambient star dots (CSS only, no Three.js needed) */}
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width:  1 + (i % 3),
            height: 1 + (i % 3),
            left:  `${(i * 37 + 11) % 97}%`,
            top:   `${(i * 53 + 7)  % 93}%`,
            opacity: 0.1 + (i % 5) * 0.08,
            animation: `pulse ${2.5 + (i % 4) * 0.8}s ease-in-out infinite`,
            animationDelay: `${(i % 6) * 0.4}s`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="text-center max-w-md relative z-10"
      >
        <p className="text-amber-400/60 text-xs tracking-[0.35em] uppercase mb-6 font-light">
          線上沉浸式展覽
        </p>
        <h1 className="text-4xl md:text-5xl font-light text-white mb-3 leading-tight">
          ChangeMaker<br />
          <span className="text-amber-300" style={{ textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
            的生命軌道
          </span>
        </h1>
        <p className="text-slate-400/80 text-sm font-light leading-relaxed mt-4 mb-10">
          每一個助人工作者，<br />都是一顆在黑暗宇宙中獨自運轉的星球。
        </p>

        {/* Entry button — click is the user gesture that unlocks AudioContext */}
        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: [
            '0 0 20px rgba(245,158,11,0.15)',
            '0 0 50px rgba(245,158,11,0.40)',
            '0 0 20px rgba(245,158,11,0.15)',
          ] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="px-10 py-4 rounded-full border border-amber-500/60 text-amber-200
            text-sm tracking-[0.2em] uppercase bg-amber-950/30 backdrop-blur-sm
            hover:bg-amber-900/40 transition-colors"
        >
          點擊進入宇宙
        </motion.button>

        <p className="text-slate-600 text-xs mt-5 tracking-wide">
          ✦ &nbsp;體驗包含環境音效
        </p>
      </motion.div>
    </motion.div>
  )
}

const ZONES = {
  landing:    { start: 0,    end: 0.12 },
  repulsion:  { start: 0.12, end: 0.38 },
  attraction: { start: 0.38, end: 0.63 },
  gravity:    { start: 0.63, end: 0.85 },
  quiz:       { start: 0.85, end: 1.0  },
}

function getZone(p) {
  for (const [name, r] of Object.entries(ZONES))
    if (p >= r.start && p < r.end) return name
  return 'quiz'
}

function getZoneProgress(zone, p) {
  const r = ZONES[zone]
  if (!r) return 0
  return Math.max(0, Math.min(1, (p - r.start) / (r.end - r.start)))
}

// Seed messages for the guestbook star field
// Stars placed at z: -4 to -11 so they're large enough to click
const SEED_MESSAGES = [
  { id:'s1',  text:'謝謝這個展覽，讓我知道我不孤單。',             tag:'#星塵共鳴', color:'#a855f7' },
  { id:'s2',  text:'差點墜落，現在慢慢找回軌道了。',               tag:'#引力祝福', color:'#f59e0b' },
  { id:'s3',  text:'體制很累，但個案的眼神值得。',                 tag:'#拉力初心', color:'#3b82f6' },
  { id:'s4',  text:'今天終於說了「不」，第一次不覺得愧疚。',       tag:'#引力祝福', color:'#f59e0b' },
  { id:'s5',  text:'燒焦過，現在在重建自己的邊界。',               tag:'#推力告白', color:'#ef4444' },
  { id:'s6',  text:'督導說：你也是值得被照顧的人。',               tag:'#星塵共鳴', color:'#a855f7' },
  { id:'s7',  text:'看完這個展，我哭了一下。很好的哭。',           tag:'#星塵共鳴', color:'#a855f7' },
  { id:'s8',  text:'那個關心個案的心從來沒有消失。',               tag:'#拉力初心', color:'#3b82f6' },
  { id:'s9',  text:'撐過了最難的那三年，現在好很多了。',           tag:'#引力祝福', color:'#f59e0b' },
  { id:'s10', text:'共情疲勞是真的，但我學會了求救。',             tag:'#推力告白', color:'#ef4444' },
]

const TAG_ACCENT = {
  '#推力告白': 'border-red-700/50 bg-red-950/40 text-red-300',
  '#拉力初心': 'border-blue-700/50 bg-blue-950/40 text-blue-300',
  '#引力祝福': 'border-amber-700/50 bg-amber-950/40 text-amber-300',
  '#星塵共鳴': 'border-purple-700/50 bg-purple-950/40 text-purple-300',
}

export default function App() {
  const scrollRef = useRef(null)
  const rafRef    = useRef(null)

  const [entered,        setEntered]        = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentZone,    setCurrentZone]    = useState('landing')
  const [zoneProgress,   setZoneProgress]   = useState({})
  const [quizResult,     setQuizResult]     = useState(null)
  const [showQuiz,       setShowQuiz]       = useState(false)

  // Sound
  // start enabled; AudioPlayer handles browser autoplay policy internally
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Guestbook
  const [guestMessages,        setGuestMessages]        = useState(SEED_MESSAGES)
  const [showGuestbook,        setShowGuestbook]        = useState(false)
  const [selectedGuestMessage, setSelectedGuestMessage] = useState(null)

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el  = scrollRef.current
      if (!el) return
      const max = el.scrollHeight - el.clientHeight
      const p   = max > 0 ? el.scrollTop / max : 0
      setScrollProgress(p)
      const zone = getZone(p)
      setCurrentZone(zone)
      setShowQuiz(p >= ZONES.quiz.start)
      setZoneProgress({
        landing:    getZoneProgress('landing', p),
        repulsion:  getZoneProgress('repulsion', p),
        attraction: getZoneProgress('attraction', p),
        gravity:    getZoneProgress('gravity', p),
        quiz:       getZoneProgress('quiz', p),
      })
    })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => { el.removeEventListener('scroll', handleScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [handleScroll])

  const handleGuestSubmit = useCallback((msg) => {
    setGuestMessages(prev => [...prev, msg])
  }, [])

  const CARD_ZONES = ['repulsion', 'attraction', 'gravity']

  return (
    <div ref={scrollRef} className="relative w-screen h-screen overflow-y-scroll overflow-x-hidden" style={{ background:'#030712' }}>

      {/* Fixed 3D canvas — renders behind splash too */}
      <div className="fixed inset-0 z-0">
        <CosmosScene
          scrollProgress={scrollProgress}
          currentZone={currentZone}
          zoneProgress={zoneProgress}
          quizResult={quizResult}
        />
      </div>

      {/* Entry splash — click unlocks AudioContext via document listener in AudioPlayer */}
      <AnimatePresence>
        {!entered && <SplashScreen onEnter={() => setEntered(true)} />}
      </AnimatePresence>

      {/* Ambient audio controller */}
      <AudioPlayer
        currentZone={currentZone}
        soundEnabled={soundEnabled}
        onToggle={() => setSoundEnabled(v => !v)}
      />

      {/* Scroll height driver */}
      <div className="relative z-10" style={{ height:'500vh' }}>

        {/* Zone text content */}
        {!showQuiz && (
          <ContentOverlay currentZone={currentZone} zoneProgress={zoneProgress} />
        )}

        {/* Interactive flip cards (repulsion / attraction / gravity) */}
        {CARD_ZONES.includes(currentZone) && !showQuiz && (
          <InteractiveCards currentZone={currentZone} />
        )}

        {/* HTML star overlay — only in quiz zone, no camera-distance issue */}
        <GuestbookStars
          messages={guestMessages}
          onStarClick={setSelectedGuestMessage}
          visible={showQuiz}
        />

        {/* Quiz */}
        {showQuiz && (
          <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-2xl mx-4">
              <Quiz onResult={setQuizResult} result={quizResult} />
            </div>
          </div>
        )}
      </div>

      {/* Guestbook trigger button */}
      <motion.button
        onClick={() => setShowGuestbook(true)}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-8 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full
          border border-amber-600/40 bg-slate-950/60 backdrop-blur-sm
          text-amber-300/80 text-xs hover:border-amber-500 hover:text-amber-200 transition-all"
      >
        <MessageCircle size={13} />
        留下星訊
        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center">
          {guestMessages.length}
        </span>
      </motion.button>

      {/* Scroll progress dots */}
      <div className="fixed bottom-8 right-32 z-30 flex flex-col items-center gap-2 opacity-50">
        {Object.keys(ZONES).map(zone => (
          <div key={zone} className="w-1.5 h-1.5 rounded-full transition-all duration-500"
            style={{ background: currentZone===zone ? '#f59e0b' : '#ffffff33', transform: currentZone===zone ? 'scale(1.6)' : 'scale(1)' }} />
        ))}
      </div>

      {/* Scroll hint */}
      {scrollProgress < 0.03 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce opacity-60">
          <span className="text-xs tracking-widest text-slate-400 uppercase">向下探索</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="6" y="0" width="4" height="4" rx="2" fill="#94a3b8" />
            <path d="M8 8 L8 20 M3 15 L8 20 L13 15" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Guestbook modal */}
      <GuestbookModal
        isOpen={showGuestbook}
        onClose={() => setShowGuestbook(false)}
        onSubmit={handleGuestSubmit}
      />

      {/* Selected guestbook message popup */}
      <AnimatePresence>
        {selectedGuestMessage && (
          <motion.div key="msg-popup"
            initial={{ opacity:0, scale:0.92, y:10 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.95, y:5 }}
            transition={{ type:'spring', stiffness:300, damping:28 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-80 pointer-events-auto"
          >
            <div className={`rounded-2xl border backdrop-blur-2xl p-4 shadow-2xl ${TAG_ACCENT[selectedGuestMessage.tag] || 'border-slate-700/50 bg-slate-900/80 text-slate-300'}`}
              style={{ boxShadow:`0 0 40px ${selectedGuestMessage.color}22, 0 4px 30px rgba(0,0,0,0.6)` }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs opacity-70 tracking-wide">{selectedGuestMessage.tag}</span>
                <button onClick={() => setSelectedGuestMessage(null)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm leading-relaxed">「{selectedGuestMessage.text}」</p>
              <p className="text-xs opacity-40 mt-2 text-right">— 來自宇宙中的另一顆星</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
