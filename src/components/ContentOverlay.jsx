import { motion, AnimatePresence } from 'framer-motion'

const ZONE_META = {
  landing: {
    badge: null,
    heading: null, // handled inline below
  },
  repulsion: {
    badge: { dot: '#ef4444', text: 'Zone I · 超新星爆發', color: 'text-red-400/80' },
    heading: '推力（Repulsion）',
    sub: '讓星球脫離軌道的離心力',
    subColor: 'text-slate-400/70',
    headingColor: 'text-red-300',
    quotes: [
      '「那天天很黑，坐在公車上，突然發現自己再也記不起當初為什麼進這個領域了。」',
      '「大家都要我保持熱情，但熱情不是可再生能源，體制每天都在拿走我的電池。」',
    ],
    stats: [
      { stat: '68%', label: '社工人員曾歷經替代性創傷' },
      { stat: '42%', label: '助人工作者於 5 年內離職' },
      { stat: '3.2×', label: 'NGO 工作者倦怠風險倍數' },
    ],
  },
  attraction: {
    badge: { dot: '#3b82f6', text: 'Zone II · 流星與吸引波', color: 'text-blue-400/80' },
    heading: '拉力（Attraction）',
    sub: '那道強烈召喚的藍光',
    headingColor: 'text-blue-300',
    subColor: 'text-slate-400/70',
    quotes: [
      '「只要看見個案有一點點進步，受的委屈就都值得了——這正是最可怕也最迷人的地方。」',
      '「拉力是光，但靠得太近，光也會把人燒焦。」',
    ],
  },
  gravity: {
    badge: { dot: '#f59e0b', text: 'Zone III · 穩定軌道', color: 'text-amber-400/80' },
    heading: '引力（Sustainable Gravity）',
    sub: '當拉力持續大於推力，透過自我照顧建立穩固軌道',
    headingColor: 'text-amber-300',
    subColor: 'text-slate-400/70',
    formula: 'Sustainable Altruism = Strong Boundaries + Collective Support − Systemic Overload',
    quote: '「真正的引力，是讓你在照亮別人的同時，自己的核心依然在穩定地發光發熱。」',
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.35 } },
}

export default function ContentOverlay({ currentZone, zoneProgress }) {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none select-none">
      <AnimatePresence mode="wait">

        {/* ── Landing ── */}
        {currentZone === 'landing' && (
          <motion.div key="landing" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            className="flex flex-col items-center justify-center h-full text-center px-6">
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, duration:1.2 }}>
              <p className="text-xs tracking-[0.3em] text-amber-400/70 uppercase mb-6 font-light">ChangeMaker 的生命軌道</p>
              <h1 className="text-3xl md:text-5xl font-light leading-relaxed text-white mb-8">
                每一個 <span className="text-amber-300 font-normal" style={{textShadow:'0 0 20px rgba(245,158,11,0.6)'}}>ChangeMaker</span>，<br />
                都是一顆在黑暗宇宙中<br />獨自運轉的星球。
              </h1>
              <p className="text-slate-300/80 text-lg font-light leading-loose mb-10">
                是什麼讓我們保持懸浮？<br />是什麼又讓我們差點墜落？
              </p>
              <motion.p animate={{ opacity:[0.4,0.8,0.4] }} transition={{ repeat:Infinity, duration:3 }}
                className="text-slate-400/60 text-sm tracking-widest">
                ↓ &nbsp; 向下滾動，進入力場
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* ── Repulsion ── */}
        {currentZone === 'repulsion' && (
          <motion.div key="repulsion" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            className="flex flex-col justify-between h-full px-6 py-12">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400/80 text-xs tracking-[0.25em] uppercase font-medium">Zone I · 超新星爆發</span>
            </div>
            <div className="max-w-xs">
              <h2 className="text-2xl font-light text-red-300 mb-1" style={{textShadow:'0 0 20px rgba(239,68,68,0.5)'}}>
                推力（Repulsion）
              </h2>
              <p className="text-slate-400/70 text-sm mb-5">讓星球脫離軌道的離心力</p>
              {ZONE_META.repulsion.quotes.map((q, i) => (
                <motion.blockquote key={i}
                  initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2+i*0.2 }}
                  className="border-l-2 border-red-700/50 pl-3 mb-3 text-slate-300 text-xs italic leading-relaxed">
                  {q}
                </motion.blockquote>
              ))}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {ZONE_META.repulsion.stats.map(s => (
                  <div key={s.stat} className="text-center bg-slate-900/40 rounded-lg p-2">
                    <div className="text-red-300 text-lg font-semibold">{s.stat}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-slate-700 text-xs italic">{/* 音效：繁雜電話聲、心跳過快 */}</p>
          </motion.div>
        )}

        {/* ── Attraction ── */}
        {currentZone === 'attraction' && (
          <motion.div key="attraction" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            className="flex flex-col justify-between h-full px-6 py-12">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400/80 text-xs tracking-[0.25em] uppercase font-medium">Zone II · 流星與吸引波</span>
            </div>
            <div className="max-w-sm mx-auto text-center">
              <h2 className="text-2xl font-light text-blue-300 mb-1" style={{textShadow:'0 0 20px rgba(59,130,246,0.5)'}}>
                拉力（Attraction）
              </h2>
              <p className="text-slate-400/70 text-sm mb-6">那道強烈召喚的藍光</p>
              {ZONE_META.attraction.quotes.map((q, i) => (
                <motion.blockquote key={i}
                  initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2+i*0.25 }}
                  className="bg-blue-950/30 border border-blue-800/30 rounded-xl px-5 py-4 mb-3 text-slate-200 text-sm italic leading-relaxed">
                  {q}
                </motion.blockquote>
              ))}
            </div>
            <p className="text-slate-700 text-xs italic">{/* 音效：溫暖但微弱的語音、風鈴聲 */}</p>
          </motion.div>
        )}

        {/* ── Gravity ── */}
        {currentZone === 'gravity' && (
          <motion.div key="gravity" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            className="flex flex-col justify-between h-full px-6 py-12">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400/80 text-xs tracking-[0.25em] uppercase font-medium">Zone III · 穩定軌道</span>
            </div>
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-2xl font-light text-amber-300 mb-1" style={{textShadow:'0 0 20px rgba(245,158,11,0.5)'}}>
                引力（Sustainable Gravity）
              </h2>
              <p className="text-slate-400/70 text-sm mb-6">永續利他的穩定軌道</p>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}
                className="bg-amber-950/20 border border-amber-700/30 rounded-xl px-5 py-4 mb-4">
                <code className="text-amber-300/80 text-xs leading-loose block">
                  {ZONE_META.gravity.formula}
                </code>
              </motion.div>
              <motion.blockquote initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.6}}
                className="text-slate-300 text-sm italic leading-relaxed">
                {ZONE_META.gravity.quote}
              </motion.blockquote>
            </div>
            <p className="text-slate-700 text-xs italic">{/* 音效：平緩呼吸聲、宇宙合成器墊底 */}</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
