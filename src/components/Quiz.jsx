import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'

const QUESTIONS = [
  {
    id: 'q1',
    text: '當個案進步不如預期時，你的第一反應是？',
    options: [
      { label: '感到挫敗，開始質疑自己的能力', weight: { burnout: 2, attraction: 0, gravity: 0 } },
      { label: '立刻想辦法加班補救，無法放手', weight: { burnout: 0, attraction: 2, gravity: 0 } },
      { label: '回顧過程、調整策略，給彼此空間', weight: { burnout: 0, attraction: 0, gravity: 2 } },
    ],
  },
  {
    id: 'q2',
    text: '下班後，你的心思通常在哪裡？',
    options: [
      { label: '還在反覆想工作中沒解決的事', weight: { burnout: 1, attraction: 1, gravity: 0 } },
      { label: '擔心某位個案的狀況', weight: { burnout: 0, attraction: 2, gravity: 0 } },
      { label: '基本上能切換到個人生活', weight: { burnout: 0, attraction: 0, gravity: 2 } },
    ],
  },
  {
    id: 'q3',
    text: '面對體制的不合理（如低薪、缺乏資源），你的感受是？',
    options: [
      { label: '憤怒且疲憊，有時想直接辭掉', weight: { burnout: 2, attraction: 0, gravity: 0 } },
      { label: '無奈，但靠對個案的愛繼續撐', weight: { burnout: 0, attraction: 2, gravity: 0 } },
      { label: '持續倡議，同時保護自己不被耗盡', weight: { burnout: 0, attraction: 0, gravity: 2 } },
    ],
  },
  {
    id: 'q4',
    text: '你最近一次「真正休息」是什麼時候？',
    options: [
      { label: '想不起來，休假也在想個案', weight: { burnout: 2, attraction: 1, gravity: 0 } },
      { label: '偶爾能，但帶著一絲罪惡感', weight: { burnout: 0, attraction: 1, gravity: 1 } },
      { label: '上週末，且享受其中', weight: { burnout: 0, attraction: 0, gravity: 2 } },
    ],
  },
  {
    id: 'q5',
    text: '「幫助他人」這件事對你而言，目前更像是？',
    options: [
      { label: '沉重的責任，有時令我喘不過氣', weight: { burnout: 2, attraction: 0, gravity: 0 } },
      { label: '強烈的召喚，讓我幾乎忘記自己', weight: { burnout: 0, attraction: 2, gravity: 0 } },
      { label: '有意義的選擇，我也照顧著自己', weight: { burnout: 0, attraction: 0, gravity: 2 } },
    ],
  },
]

const RESULTS = {
  burnout: {
    type: 'burnout',
    name: '離心漂流星球',
    emoji: '🔴',
    colorClass: 'text-red-300',
    borderClass: 'border-red-800/50',
    bgClass: 'bg-red-950/30',
    desc: '強烈的推力正在耗盡你的能量。你仍在奮鬥，但可能已承受過多創傷。',
    guide: [
      '🔴 立即尋求督導或諮商支持——不是軟弱，是求生本能',
      '🔴 審視案量，勇於向主管提出調整',
      '🔴 每天設定一個「宇宙靜止時刻」：哪怕只有10分鐘',
      '🔴 你不需要燃燒自己來照亮別人',
    ],
    shareText: '我是一顆離心漂流星球。正在尋找回到軌道的路。 #ChangeMaker生命軌道',
  },
  attraction: {
    type: 'attraction',
    name: '極限拉扯星球',
    emoji: '🔵',
    colorClass: 'text-blue-300',
    borderClass: 'border-blue-800/50',
    bgClass: 'bg-blue-950/30',
    desc: '對工作的熱情與使命感驅動著你，但你的邊界正在模糊。',
    guide: [
      '🔵 熱情是燃料，邊界是引擎——兩者缺一不可',
      '🔵 練習「下班儀式」：讓大腦知道今天結束了',
      '🔵 試著說「我盡力了」，而不是「我應該更努力」',
      '🔵 允許個案在你的陪伴外，也擁有自己的力量',
    ],
    shareText: '我是一顆極限拉扯星球。熱情正在帶我飛，我也在學習邊界。 #ChangeMaker生命軌道',
  },
  gravity: {
    type: 'gravity',
    name: '黃金引力平衡星球',
    emoji: '✨',
    colorClass: 'text-amber-300',
    borderClass: 'border-amber-700/50',
    bgClass: 'bg-amber-950/20',
    desc: '你找到了自己的穩定軌道。拉力大於推力，且你正在照顧自己。這是一種稀有的智慧。',
    guide: [
      '✨ 繼續維持你的自我照顧結構——它是你力量的來源',
      '✨ 你的穩定對周圍人是一種示範與保護',
      '✨ 分享你的邊界經驗，成為其他 ChangeMaker 的錨點',
      '✨ 在動盪的星系中，做那顆沉穩的行星',
    ],
    shareText: '我是一顆黃金引力平衡星球。在持續助人的同時，我也好好照顧自己。 #ChangeMaker生命軌道',
  },
}

function computeResult(answers) {
  const scores = { burnout: 0, attraction: 0, gravity: 0 }
  for (const ans of Object.values(answers)) {
    scores.burnout += ans.burnout
    scores.attraction += ans.attraction
    scores.gravity += ans.gravity
  }
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  return RESULTS[winner]
}

// ─── Individual Question ──────────────────────────────────────────────────────
function Question({ question, selected, onSelect, index, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <p className="text-slate-400 text-xs mb-2 tracking-widest">
        {index + 1} / {total}
      </p>
      <h3 className="text-white text-base md:text-lg font-light leading-relaxed mb-5">
        {question.text}
      </h3>
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(question.id, opt.weight)}
            className={`
              text-left px-4 py-3 rounded-xl border text-sm leading-relaxed transition-all duration-300
              ${selected
                ? JSON.stringify(selected) === JSON.stringify(opt.weight)
                  ? 'border-amber-500/70 bg-amber-900/30 text-amber-200'
                  : 'border-slate-700/30 bg-slate-900/20 text-slate-500'
                : 'border-slate-700/50 bg-slate-900/30 text-slate-300 hover:border-amber-600/50 hover:bg-amber-950/20 hover:text-amber-100'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// Planet visual configs per result type
const PLANET_VISUAL = {
  burnout: {
    core: 'radial-gradient(circle at 38% 35%, #ff4422 0%, #991100 45%, #220000 100%)',
    glow: '#ef444455',
    orbits: [],
    crack: true,
  },
  attraction: {
    core: 'radial-gradient(circle at 38% 35%, #60a5fa 0%, #1d4ed8 45%, #0a1547 100%)',
    glow: '#3b82f655',
    orbits: [{ size: 130, tilt: 15, color: '#60a5fa44', dur: '3s' }],
    crack: false,
  },
  gravity: {
    core: 'radial-gradient(circle at 38% 35%, #fcd34d 0%, #d97706 40%, #1a0e00 100%)',
    glow: '#f59e0b55',
    orbits: [
      { size: 130, tilt: 20,  color: '#f59e0b88', dur: '4s'   },
      { size: 160, tilt: -30, color: '#f59e0b55', dur: '6.5s' },
      { size: 190, tilt: 50,  color: '#f59e0b33', dur: '10s'  },
    ],
    crack: false,
  },
}

function PlanetVisual({ type }) {
  const v = PLANET_VISUAL[type] || PLANET_VISUAL.gravity
  return (
    <div className="relative flex items-center justify-center my-4" style={{ height: 200 }}>
      {/* Orbits */}
      {v.orbits.map((o, i) => (
        <div key={i} className="absolute rounded-full border"
          style={{
            width: o.size, height: o.size,
            borderColor: o.color,
            transform: `rotateX(${o.tilt}deg)`,
            animation: `spin ${o.dur} linear infinite`,
            boxShadow: `0 0 8px ${o.color}`,
          }}
        />
      ))}
      {/* Glow */}
      <div className="absolute rounded-full"
        style={{ width: 90, height: 90, background: v.glow, filter: 'blur(18px)' }} />
      {/* Planet */}
      <div className="relative rounded-full z-10"
        style={{ width: 72, height: 72, background: v.core, boxShadow: `0 0 28px ${v.glow}` }}>
        {/* Highlight */}
        <div className="absolute rounded-full bg-white/20"
          style={{ width: 22, height: 14, top: 10, left: 12, filter: 'blur(3px)' }} />
        {/* Crack lines for burnout */}
        {v.crack && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 72 72">
            <path d="M36 10 L30 30 L38 35 L28 62" stroke="#ff6644" strokeWidth="1.2" fill="none" opacity="0.7" />
            <path d="M50 18 L42 38 L48 42" stroke="#ff4422" strokeWidth="0.8" fill="none" opacity="0.5" />
          </svg>
        )}
      </div>
    </div>
  )
}

// ─── Result Display ───────────────────────────────────────────────────────────
function ResultDisplay({ result, onRetry }) {
  const [copied, setCopied] = useState(false)
  const [screenshotting, setScreenshotting] = useState(false)
  const resultRef = useRef(null)

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(result.shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleScreenshot = async () => {
    if (!resultRef.current || screenshotting) return
    
    try {
      setScreenshotting(true)
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#030712',
        scale: 2,
        logging: false,
        useCORS: true,
      })
      
      // Convert canvas to blob and trigger download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `wellplanet-${result.type}-result.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
        setScreenshotting(false)
      })
    } catch (error) {
      console.error('Screenshot failed:', error)
      setScreenshotting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Screenshot area - only content */}
      <div ref={resultRef} className={`border ${result.borderClass} ${result.bgClass} backdrop-blur-sm rounded-2xl p-6 mb-4`}>
        {/* Planet visual */}
        <PlanetVisual type={result.type} />
        <div className="text-center mb-5">
          <h3 className={`text-xl font-semibold ${result.colorClass}`}>{result.name}</h3>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{result.desc}</p>
        </div>

        <div className="border-t border-slate-700/30 pt-4">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">
            ✦ &nbsp;星際生存指南
          </p>
          <ul className="space-y-2">
            {result.guide.map((tip, i) => (
              <li key={i} className="text-slate-300 text-sm leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main CTA - Visit Website (outside result card) */}
      <a
        href="https://www.wellplanet.org.tw/"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3.5 mb-3 rounded-xl text-center font-medium text-base
          bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950
          hover:from-amber-400 hover:to-amber-500 
          transition-all duration-300 shadow-lg hover:shadow-amber-500/50
          hover:scale-[1.02] active:scale-[0.98]"
        style={{ 
          boxShadow: '0 0 30px rgba(245,158,11,0.3), 0 4px 15px rgba(0,0,0,0.3)' 
        }}
      >
        探索好好星球文化基金會
      </a>

      {/* Secondary actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleScreenshot}
          disabled={screenshotting}
          className="py-2.5 rounded-xl border border-slate-600/50 bg-slate-800/30 text-slate-300 text-xs
            hover:border-amber-500/50 hover:text-amber-300 transition-all disabled:opacity-50"
        >
          {screenshotting ? '截圖中...' : '截圖'}
        </button>
        <button
          onClick={handleShare}
          className="py-2.5 rounded-xl border border-slate-600/50 bg-slate-800/30 text-slate-300 text-xs
            hover:border-amber-500/50 hover:text-amber-300 transition-all"
        >
          {copied ? '已複製' : '複製'}
        </button>
        <button
          onClick={onRetry}
          className="py-2.5 rounded-xl border border-slate-700/50 bg-slate-900/30 text-slate-500 text-xs
            hover:text-slate-300 transition-all"
        >
          重新測驗
        </button>
      </div>
    </motion.div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div className="flex gap-1.5 mb-5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-0.5 flex-1 rounded-full transition-all duration-500"
          style={{ background: i < current ? '#f59e0b' : '#334155' }}
        />
      ))}
    </div>
  )
}

// ─── Main Quiz Component ──────────────────────────────────────────────────────
export default function Quiz({ onResult, result }) {
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (qId, weight) => {
    const newAnswers = { ...answers, [qId]: weight }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1)
      } else {
        const res = computeResult(newAnswers)
        setShowResult(true)
        onResult(res)
      }
    }, 400)
  }

  const handleRetry = () => {
    setAnswers({})
    setCurrentQ(0)
    setShowResult(false)
    onResult(null)
  }

  const computedResult = useMemo(() => {
    if (!showResult) return null
    return computeResult(answers)
  }, [showResult, answers])

  return (
    <div className="bg-slate-950/80 border border-slate-700/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
      <div className="mb-4 text-center">
        <p className="text-amber-400/80 text-xs tracking-[0.25em] uppercase mb-1">生成你的專屬軌道</p>
        {!showResult && (
          <p className="text-slate-400 text-xs">回答以下問題，發現你目前的宇宙狀態</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div key="quiz">
            <ProgressBar current={currentQ} total={QUESTIONS.length} />
            <Question
              key={QUESTIONS[currentQ].id}
              question={QUESTIONS[currentQ]}
              selected={answers[QUESTIONS[currentQ].id]}
              onSelect={handleSelect}
              index={currentQ}
              total={QUESTIONS.length}
            />
          </motion.div>
        ) : (
          <motion.div key="result">
            <ResultDisplay result={computedResult} onRetry={handleRetry} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
