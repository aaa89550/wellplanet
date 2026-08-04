import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Stable screen positions spread across the quiz canvas
const SCREEN_POSITIONS = [
  { left: '12%', top: '18%' },
  { left: '78%', top: '14%' },
  { left: '28%', top: '72%' },
  { left: '68%', top: '68%' },
  { left:  '8%', top: '50%' },
  { left: '88%', top: '42%' },
  { left: '48%', top: '10%' },
  { left: '18%', top: '82%' },
  { left: '82%', top: '78%' },
  { left: '55%', top: '88%' },
  { left: '38%', top: '35%' },
  { left: '65%', top: '30%' },
]

// Assign or fall back to a generated position for messages beyond the preset list
function getPos(index) {
  if (index < SCREEN_POSITIONS.length) return SCREEN_POSITIONS[index]
  const angle = index * 2.4
  return {
    left: `${15 + ((Math.sin(angle) * 0.5 + 0.5) * 70)}%`,
    top:  `${10 + ((Math.cos(angle) * 0.5 + 0.5) * 75)}%`,
  }
}

function StarDot({ message, index, onClick }) {
  const [hovered, setHovered] = useState(false)
  const pos = message.screenPos ?? getPos(index)

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 220, damping: 20 }}
      onClick={() => onClick(message)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute"
      style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: hovered ? [1, 1.5, 1] : [1, 1.2, 1], opacity: hovered ? 0.6 : 0.25 }}
        transition={{ repeat: Infinity, duration: hovered ? 1.2 : 3, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
        style={{
          width: 28, height: 28,
          background: message.color + '44',
          filter: `blur(6px)`,
          margin: -4,
        }}
      />
      {/* Core dot */}
      <motion.div
        animate={{ scale: hovered ? 1.5 : 1 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-full z-10"
        style={{
          width: 20,
          height: 20,
          background: `radial-gradient(circle at 35% 35%, ${message.color}ff, ${message.color}88)`,
          boxShadow: `0 0 ${hovered ? 16 : 8}px ${message.color}cc, 0 0 ${hovered ? 32 : 14}px ${message.color}55`,
        }}
      />
      {/* Tag tooltip on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-20
              text-[10px] px-2 py-0.5 rounded-full pointer-events-none"
            style={{
              background: message.color + '22',
              border: `1px solid ${message.color}55`,
              color: message.color,
            }}
          >
            {message.tag}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── Main overlay (shown in quiz zone) ───────────────────────────────────────
export default function GuestbookStars({ messages, onStarClick, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="guestbook-stars"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-15 pointer-events-none"
          // Allow pointer events only on individual dots
          style={{ pointerEvents: 'none' }}
        >
          <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
            {messages.map((msg, i) => (
              <div key={msg.id} style={{ pointerEvents: 'auto', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
                <StarDot message={msg} index={i} onClick={onStarClick} />
              </div>
            ))}
          </div>

          {/* Hint label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 text-xs text-slate-500 tracking-widest pointer-events-none select-none"
          >
            ✦ &nbsp;{messages.length} 顆星訊漂浮其中 &nbsp;·&nbsp; 點擊閱讀
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
