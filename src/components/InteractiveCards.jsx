import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// ─── Card Content Data ────────────────────────────────────────────────────────
const CARD_DATA = {
  repulsion: [
    {
      id: 'r1',
      front: { icon: '🌪️', title: '體制重力解構', teaser: '那些讓你喘不過氣的，並非你的失敗。', color: '#ef4444' },
      back:  { title: '卸力練習', content: '拿一張紙，把今天消耗你能量的事全部列出來。\n在每一條旁邊標記：「這是我能控制的嗎？」\n\n若不能——寫下：\n「我選擇放下對它的責任感。」\n\n體制的重量，不應由你一人扛起。', cta: '現在試試', icon: '🌪️' },
    },
    {
      id: 'r2',
      front: { icon: '🧠', title: '情緒急救包', teaser: '共情疲勞是神經系統的求救訊號，不是弱點。', color: '#f97316' },
      back:  { title: '4-4-6 急救呼吸', content: '1. 停下來，感受身體哪裡緊繃\n2. 吸氣 4 拍，屏息 4 拍，呼氣 6 拍\n3. 默念：「我陪他走過了那一段，這已足夠」\n4. 給自己一個微小獎勵，不需要理由', cta: '深呼吸一次', icon: '🧠' },
    },
    {
      id: 'r3',
      front: { icon: '🔥', title: '憤怒的煉金術', teaser: '憤怒往往是愛最深刻的另一面。', color: '#dc2626' },
      back:  { title: '轉化問句', content: '寫下讓你憤怒的體制問題。\n然後問自己：\n「這讓我憤怒，是因為我在乎什麼？」\n\n那個答案，就是你仍然持有的初心。\n憤怒可以成為倡議的燃料。', cta: '寫下來', icon: '🔥' },
    },
  ],
  attraction: [
    {
      id: 'a1',
      front: { icon: '✨', title: '微光記憶錦囊', teaser: '那個讓你走進這個領域的最初瞬間。', color: '#3b82f6' },
      back:  { title: '初心記憶練習', content: '閉眼，回到你第一次感受到「這就是我想做的事」的那一刻。\n\n那裡有什麼？誰在那裡？\n你感受到什麼？\n\n把那個畫面存進記憶的保險箱——它是你在最暗的夜裡仍然持有的光。', cta: '閉眼 30 秒', icon: '✨' },
    },
    {
      id: 'a2',
      front: { icon: '⚡', title: '使命與邊界共舞', teaser: '熱情與界線並存，才是永續的利他之道。', color: '#60a5fa' },
      back:  { title: '今日平衡宣言', content: '試著在一件事上說：\n「我全力以赴，但我也有限制。」\n\n全力以赴 ≠ 無限付出。\n你可以同時深深在乎，又清楚保護自己。\n\n這不是冷漠，這是永續。', cta: '說出來', icon: '⚡' },
    },
    {
      id: 'a3',
      front: { icon: '🌊', title: '拯救者解咒', teaser: '「只有我能救他」——值得被溫柔鬆開。', color: '#6366f1' },
      back:  { title: '三句解咒文', content: '默念三次：\n\n「我陪伴他，但他的生命屬於他自己。」\n\n「我的限制不是拋棄，是讓他相信自己。」\n\n「宇宙中不止有我這顆星。」', cta: '默念一次', icon: '🌊' },
    },
  ],
  gravity: [
    {
      id: 'g1',
      front: { icon: '⬡', title: '邊界宣言', teaser: '今天，我選擇清楚地說「不」。', color: '#f59e0b' },
      back:  { title: '邊界行動卡', content: '今天找一件你可以練習說「不」的事——哪怕只是一件小事。\n\n說完後，注意你的身體感受。\n\n邊界不是牆，是讓你能夠持續行走的地基。\n每一次練習，都在為你的軌道添加厚度。', cta: '找到那件事', icon: '⬡' },
    },
    {
      id: 'g2',
      front: { icon: '◯', title: '自我照顧處方箋', teaser: '你的休息，是你能給個案最重要的準備。', color: '#d97706' },
      back:  { title: '今日照顧清單', content: '選一個，現在就安排：\n\n□ 15 分鐘靜默，不做任何事\n□ 一頓好好吃的飯，不滑手機\n□ 對信任的人說「我今天有點累」\n□ 任何形式的身體移動\n□ 看一個讓你笑的事物', cta: '勾選一項', icon: '◯' },
    },
    {
      id: 'g3',
      front: { icon: '🛸', title: '支持星系盤點', teaser: '你不是孤星——誰是你的衛星？', color: '#fbbf24' },
      back:  { title: '三顆衛星盤點', content: '在腦海中列出三個人：\n\n1. 崩潰時可以打電話的人\n2. 談工作困境不被評判的人\n3. 讓你在非工作狀態下感到自在的人\n\n若有空格，那是今天可以開始填補的方向。', cta: '想想他們是誰', icon: '🛸' },
    },
  ],
}

const ZONE_COLORS = { repulsion: '#ef4444', attraction: '#3b82f6', gravity: '#f59e0b' }
const ZONE_LABELS = { repulsion: '卸力練習牌卡', attraction: '初心微光牌卡', gravity: '引力行動牌卡' }

// ─── Card Modal (pop-out back content) ────────────────────────────────────────
function CardModal({ card, zoneColor, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      key="card-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(3,7,18,0.72)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1,    opacity: 1, rotateY: 0 }}
        exit={{    scale: 0.92, opacity: 0, rotateY: 90 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        style={{ transformOrigin: 'center', perspective: '800px' }}
        className="w-full max-w-sm rounded-2xl border backdrop-blur-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(8,12,28,0.95)',
          border: `1px solid ${zoneColor}44`,
          boxShadow: `0 0 50px ${zoneColor}22, 0 8px 40px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Accent bar */}
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${zoneColor}bb, transparent)` }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{card.back.icon}</span>
              <h2 className="text-lg font-semibold" style={{ color: zoneColor }}>
                {card.back.title}
              </h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors mt-1">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="text-slate-300 text-sm leading-[1.85] whitespace-pre-line mb-6">
            {card.back.content}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <span
              className="text-xs px-4 py-2 rounded-full font-medium"
              style={{ background: zoneColor + '22', color: zoneColor, border: `1px solid ${zoneColor}55` }}
            >
              {card.back.cta}
            </span>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              繼續探索 →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Front Card Tile (compact, click to open modal) ───────────────────────────
function CardTile({ card, zoneColor, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 w-44 h-36 rounded-xl border text-left p-4 flex flex-col justify-between backdrop-blur-md transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, ${zoneColor}15 0%, rgba(8,12,28,0.8) 100%)`,
        border: `1px solid ${zoneColor}35`,
        boxShadow: `0 4px 20px ${zoneColor}15`,
      }}
    >
      <div>
        <div className="text-2xl mb-2">{card.front.icon}</div>
        <h3 className="text-white text-xs font-medium leading-snug mb-1">{card.front.title}</h3>
        <p className="text-slate-400/80 text-[11px] leading-relaxed line-clamp-2">{card.front.teaser}</p>
      </div>
      <p className="text-[10px] tracking-wider mt-1" style={{ color: zoneColor + '99' }}>
        點擊展開 →
      </p>
    </motion.button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
// need useEffect for keyboard listener in CardModal — imported above
export default function InteractiveCards({ currentZone }) {
  const [openCard, setOpenCard] = useState(null)
  const cards     = CARD_DATA[currentZone]
  const zoneColor = ZONE_COLORS[currentZone]
  const label     = ZONE_LABELS[currentZone]

  return (
    <>
      <AnimatePresence mode="wait">
        {cards && (
          <motion.div
            key={currentZone}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed bottom-8 left-0 right-0 z-20 flex flex-col items-center pointer-events-auto"
          >
            <p className="text-xs tracking-widest uppercase mb-2 opacity-70 bg-slate-950/60 backdrop-blur-sm px-3 py-1 rounded-full" style={{ color: zoneColor }}>
              ✦ &nbsp;{label} &nbsp;·&nbsp; 點擊展開
            </p>
            <div className="flex gap-3 px-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {cards.map(card => (
                <CardTile
                  key={card.id}
                  card={card}
                  zoneColor={zoneColor}
                  onClick={() => setOpenCard(card)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-out modal */}
      <AnimatePresence>
        {openCard && (
          <CardModal
            key={openCard.id}
            card={openCard}
            zoneColor={zoneColor}
            onClose={() => setOpenCard(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
