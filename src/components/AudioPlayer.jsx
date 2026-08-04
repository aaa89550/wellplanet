import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

const ZONE_CONFIG = {
  landing:    { freqs: [55, 82.5],         type: 'sine',     gain: 0.030, filterHz: 700,  lfoRate: 0.08 },
  repulsion:  { freqs: [58, 62, 87, 116],  type: 'sawtooth', gain: 0.018, filterHz: 280,  lfoRate: 5.0  },
  attraction: { freqs: [220, 330, 440],    type: 'sine',     gain: 0.025, filterHz: 1600, lfoRate: 0.25 },
  gravity:    { freqs: [110, 165, 220],    type: 'sine',     gain: 0.028, filterHz: 950,  lfoRate: 0.08 },
  quiz:       { freqs: [174, 261, 349],    type: 'sine',     gain: 0.022, filterHz: 1100, lfoRate: 0.12 },
}

export default function AudioPlayer({ currentZone, soundEnabled, onToggle }) {
  // All audio state lives in a single ref to avoid stale-closure issues
  const audio = useRef({
    ctx: null, master: null, filter: null,
    nodes: [], prevZone: null, running: false,
  })
  // Keep latest values accessible inside event callbacks without re-registering
  const zoneRef    = useRef(currentZone)
  const enabledRef = useRef(soundEnabled)
  useEffect(() => { zoneRef.current = currentZone },    [currentZone])
  useEffect(() => { enabledRef.current = soundEnabled }, [soundEnabled])

  // ── Build graph (idempotent) ──────────────────────────────────────────────
  const buildGraph = () => {
    const a = audio.current
    if (a.ctx) return
    const ctx     = new (window.AudioContext || window.webkitAudioContext)()
    const master  = ctx.createGain()
    const filter  = ctx.createBiquadFilter()
    const limiter = ctx.createDynamicsCompressor()
    filter.type = 'lowpass'; filter.frequency.value = 700; filter.Q.value = 1.2
    master.gain.setValueAtTime(0, 0)
    master.connect(filter); filter.connect(limiter); limiter.connect(ctx.destination)
    a.ctx = ctx; a.master = master; a.filter = filter
  }

  // ── Play a zone (only when context is confirmed running) ──────────────────
  const playZone = (zone) => {
    const a = audio.current
    if (!a.ctx || a.ctx.state !== 'running') return
    const cfg = ZONE_CONFIG[zone] || ZONE_CONFIG.landing
    const now = a.ctx.currentTime

    // Fade out + stop old oscillators
    a.nodes.forEach(({ osc, g, lfo, lfoG }) => {
      try { g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(0, now + 0.7) } catch {}
      setTimeout(() => { try { osc.stop(); osc.disconnect() } catch {} }, 800)
      try { lfo?.stop(); lfo?.disconnect(); lfoG?.disconnect() } catch {}
    })
    a.nodes = []

    // Glide filter
    a.filter.frequency.cancelScheduledValues(now)
    a.filter.frequency.setValueAtTime(a.filter.frequency.value, now)
    a.filter.frequency.linearRampToValueAtTime(cfg.filterHz, now + 1.5)

    // New oscillators
    cfg.freqs.forEach((freq, i) => {
      const osc = a.ctx.createOscillator()
      const g   = a.ctx.createGain()
      osc.type = cfg.type
      osc.frequency.setValueAtTime(freq, now)
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(cfg.gain, now + 1.2)

      let lfo = null, lfoG = null
      if (i > 0) {
        lfo  = a.ctx.createOscillator()
        lfoG = a.ctx.createGain()
        lfo.frequency.setValueAtTime(cfg.lfoRate, now)
        lfoG.gain.setValueAtTime(cfg.lfoRate > 1 ? freq * 0.015 : freq * 0.003, now)
        lfo.connect(lfoG); lfoG.connect(osc.frequency); lfo.start()
      }
      osc.connect(g); g.connect(a.master); osc.start()
      a.nodes.push({ osc, g, lfo, lfoG })
    })

    a.prevZone = zone
  }

  // ── Bootstrap: build + resume + start zone (called on first user gesture) ─
  const bootstrap = async () => {
    const a = audio.current
    if (a.running) return
    buildGraph()
    try { await a.ctx.resume() } catch {}
    if (a.ctx.state !== 'running') return   // blocked by browser; bail

    const vol = enabledRef.current ? 1 : 0
    a.master.gain.setValueAtTime(0, a.ctx.currentTime)
    a.master.gain.linearRampToValueAtTime(vol, a.ctx.currentTime + 0.8)
    playZone(zoneRef.current)
    a.running = true
  }

  // ── Register one-time interaction listener ────────────────────────────────
  useEffect(() => {
    const go = () => bootstrap()
    document.addEventListener('click',      go, { once: true })
    document.addEventListener('touchstart', go, { once: true })
    document.addEventListener('keydown',    go, { once: true })
    return () => {
      document.removeEventListener('click',      go)
      document.removeEventListener('touchstart', go)
      document.removeEventListener('keydown',    go)
    }
  }, []) // intentionally empty — bootstrap reads latest values via refs

  // ── Zone change after bootstrap ───────────────────────────────────────────
  useEffect(() => {
    const a = audio.current
    if (!a.running || a.prevZone === currentZone) return
    playZone(currentZone)
  }, [currentZone])

  // ── Mute / unmute ─────────────────────────────────────────────────────────
  useEffect(() => {
    const a = audio.current
    if (!a.ctx) return
    const now = a.ctx.currentTime
    a.master.gain.setValueAtTime(a.master.gain.value, now)
    a.master.gain.linearRampToValueAtTime(soundEnabled ? 1 : 0, now + 0.5)
    // If unmuting and context was somehow suspended, try to resume
    if (soundEnabled && a.ctx.state === 'suspended') {
      a.ctx.resume().then(() => { if (!a.running) bootstrap() })
    }
  }, [soundEnabled])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    const a = audio.current
    a.nodes.forEach(({ osc, lfo }) => {
      try { osc.stop() } catch {}
      try { lfo?.stop() } catch {}
    })
    a.ctx?.close()
  }, [])

  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.88 }}
      title={soundEnabled ? '靜音' : '開啟環境音效'}
      className={`
        fixed top-5 right-5 z-40 w-10 h-10 rounded-full border backdrop-blur-sm
        flex items-center justify-center transition-all duration-300
        ${soundEnabled
          ? 'border-amber-500/60 bg-amber-950/30 text-amber-300'
          : 'border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300'}
      `}
    >
      {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
    </motion.button>
  )
}
