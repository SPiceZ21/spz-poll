import { useState, useEffect } from 'preact/hooks'

interface PollOption {
  label?: string
  name?: string
  type?: string
  laps?: number
  checkpointCount?: number
  subtext?: string
  class?: string
  stats?: { label: string; value: string }[]
  path?: { x: number; y: number }[]   // track route, world XY, in lap order
  loop?: boolean                      // circuit: the route closes on itself
}

/* ── Track preview ───────────────────────────────────────────
   The route drawn top-down over the game map, so a track is voted on by its
   shape rather than its name.

   World → SVG: Y is flipped (GTA +Y is north, SVG +Y is down) and the scale is
   the tighter of the two axes, so the plot keeps its real proportions instead of
   being stretched to fill the card.

   The map itself is optional. Drop a top-down render of the world at
   ui/public/map.jpg and it appears underneath, cropped to the track's corner of
   the world; without it the plot falls back to a grid, which is why the route,
   the start marker and the frame are all drawn independently of the image. */

// Corners of the world the map image covers, in game coordinates. These are the
// standard Los Santos + Blaine County bounds every GTA map render uses; a
// differently-cropped image needs these changed to match it.
const MAP = { minX: -4000, maxX: 4500, minY: -4300, maxY: 8200, src: 'map.jpg' }

const VIEW_W = 300
const VIEW_H = 132

/** Catmull-Rom through every point as cubic beziers: the checkpoints are metres
 *  apart, and straight segments between them read as a jagged polygon rather
 *  than a road. */
function smoothPath(pts: { x: number; y: number }[], close: boolean): string {
  const n = pts.length
  if (n < 2) return ''
  const at = (i: number) => pts[close ? (i + n) % n : Math.max(0, Math.min(n - 1, i))]

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  const last = close ? n - 1 : n - 2
  for (let i = 0; i <= last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2)
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  if (close) d += ' Z'
  return d
}

/** World-anchored grid for the no-image fallback: one line every 200 m, drawn
 *  across a generous margin either side so it still covers the card once the
 *  aspect-fit leaves slack on one axis. */
function gridLines(
  minX: number, maxX: number, minY: number, maxY: number,
  px: (x: number) => number, py: (y: number) => number,
) {
  const STEP = 200
  const out = []
  const x0 = Math.floor((minX - STEP * 6) / STEP) * STEP
  const x1 = maxX + STEP * 6
  const y0 = Math.floor((minY - STEP * 6) / STEP) * STEP
  const y1 = maxY + STEP * 6
  for (let x = x0; x <= x1; x += STEP) {
    out.push(<line key={`v${x}`} x1={px(x)} y1={0} x2={px(x)} y2={VIEW_H} stroke="rgba(255,255,255,0.05)" stroke-width="1" />)
  }
  for (let y = y0; y <= y1; y += STEP) {
    out.push(<line key={`h${y}`} x1={0} y1={py(y)} x2={VIEW_W} y2={py(y)} stroke="rgba(255,255,255,0.05)" stroke-width="1" />)
  }
  return out
}

const TrackMap = ({ path, loop, index }: { path?: { x: number; y: number }[]; loop?: boolean; index: number }) => {
  const [noMap, setNoMap] = useState(false)
  if (!path || path.length < 2) return null

  // Track bounds, squared off and padded so the route sits centred with a
  // little of the surrounding world around it.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of path) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const spanX = Math.max(maxX - minX, 1)
  const spanY = Math.max(maxY - minY, 1)
  const pad = 0.14
  const scale = Math.min(VIEW_W / (spanX * (1 + pad * 2)), VIEW_H / (spanY * (1 + pad * 2)))
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  const px = (x: number) => VIEW_W / 2 + (x - cx) * scale
  const py = (y: number) => VIEW_H / 2 - (y - cy) * scale

  const pts = path.map(p => ({ x: px(p.x), y: py(p.y) }))
  const d = smoothPath(pts, !!loop)
  const start = pts[0]
  const finish = pts[pts.length - 1]

  const clipId = `trackclip${index}`
  const gradId = `trackgrad${index}`

  return (
    <div class="poll-map">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <clipPath id={clipId}><rect x="0" y="0" width={VIEW_W} height={VIEW_H} /></clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="var(--color-primary)" />
            <stop offset="100%" stop-color="var(--color-secondary, var(--color-primary))" />
          </linearGradient>
        </defs>

        <g clip-path={`url(#${clipId})`}>
          {!noMap && (
            <image
              href={MAP.src}
              x={px(MAP.minX)}
              y={py(MAP.maxY)}
              width={(MAP.maxX - MAP.minX) * scale}
              height={(MAP.maxY - MAP.minY) * scale}
              preserveAspectRatio="none"
              opacity="0.55"
              onError={() => setNoMap(true)}
            />
          )}
          {/* No map image: a 200 m grid pinned to world coordinates, so the
              plot still carries a sense of scale and of the track drifting
              across the world as it turns. */}
          {noMap && gridLines(minX, maxX, minY, maxY, px, py)}

          {/* Cast shadow first so the route reads over busy map detail. */}
          <path d={d} fill="none" stroke="rgba(0,0,0,0.65)" stroke-width="5"
                stroke-linecap="round" stroke-linejoin="round" />
          <path d={d} fill="none" stroke={`url(#${gradId})`} stroke-width="2.4"
                stroke-linecap="round" stroke-linejoin="round" />

          {/* Start/finish. A circuit's route closes on itself, so one marker
              says everything; a sprint needs both ends called out. */}
          <circle cx={start.x} cy={start.y} r="4.2" fill="#0b0b0b" />
          <circle cx={start.x} cy={start.y} r="2.6" fill="#29D398" />
          {!loop && (
            <>
              <circle cx={finish.x} cy={finish.y} r="4.2" fill="#0b0b0b" />
              <circle cx={finish.x} cy={finish.y} r="2.6" fill="#FF3D55" />
            </>
          )}
        </g>
      </svg>
      <div class="poll-map-fade" />
    </div>
  )
}

// Base theme (server.cfg spz_theme_* convars, pushed from spz-core) mapped
// onto this page's own CSS variable names (theme.css). Unknown/missing keys
// are a no-op since the stylesheet's own defaults still apply.
const THEME_VARS: Record<string, string> = {
  accent: '--color-primary',
  accent2: '--color-secondary',
  bg: '--bg-app',
  bg2: '--bg-card',
}
// rgba(...) glows/tints reference the accent as raw components so they can
// carry their own alpha — keep those in sync too.
const THEME_RGB_VARS: Record<string, string> = { accent: '--color-primary-rgb' }
function hexToRgbTriplet(hex?: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : null
}
function applyTheme(theme?: Record<string, string>) {
  if (!theme) return
  for (const key in THEME_VARS) {
    if (theme[key]) document.documentElement.style.setProperty(THEME_VARS[key], theme[key])
  }
  for (const key in THEME_RGB_VARS) {
    const rgb = theme[key] && hexToRgbTriplet(theme[key])
    if (rgb) document.documentElement.style.setProperty(THEME_RGB_VARS[key], rgb)
  }
}

export function App() {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<'track' | 'vehicle' | 'traffic'>('track')
  const [options, setOptions] = useState<PollOption[]>([])
  const [duration, setDuration] = useState(30)
  const [timer, setTimer] = useState(100)
  const [votedIndex, setVotedIndex] = useState(-1)
  const [winnerIndex, setWinnerIndex] = useState(-1)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data?.action) return
      const { action, data = {}, theme } = e.data
      if (action === 'theme') {
        applyTheme(theme)
      } else if (action === 'openPoll') {
        const opts: PollOption[] = data.options || []
        setPhase(data.phase || 'track')
        setOptions(opts)
        setDuration(data.duration || 30)
        setTimer(100)
        setVotedIndex(-1)
        setWinnerIndex(-1)
        setVisible(true)
      } else if (action === 'updatePoll') {
        if (data.winner) setWinnerIndex(data.winner.index - 1)
      } else if (action === 'closePoll') {
        setVisible(false)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  useEffect(() => {
    if (!visible || winnerIndex !== -1) return
    const step = (100 / (duration * 1000)) * 100
    const t = setInterval(() => setTimer(prev => Math.max(0, prev - step)), 100)
    return () => clearInterval(t)
  }, [visible, duration, winnerIndex])

  const post = (endpoint: string, body: unknown) =>
    fetch(`https://${GetParentResourceName()}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})

  const vote = (idx: number) => {
    if (votedIndex !== -1 || winnerIndex !== -1) return
    setVotedIndex(idx)
    post('pollVote', { index: idx + 1 })
  }

  if (!visible) return null

  return (
    <div class="poll-overlay" data-phase={phase}>
      <div class="poll-header">
        <div class="poll-phase-label">
          {phase === 'track' ? 'Track Selection' : phase === 'traffic' ? 'Traffic Selection' : 'Vehicle Selection'}
        </div>
        <h1 class="poll-main-title">
          {phase === 'track' ? 'Choose Your Path' : phase === 'traffic' ? 'Set Road Density' : 'Select Performance'}
        </h1>
      </div>

      <div class="poll-options">
        {options.map((opt, i) => (
          <div
            key={i}
            class="poll-card"
            data-selected={votedIndex === i}
            onClick={() => vote(i)}
          >
            <span class="poll-bg-num">{i + 1}</span>
            {winnerIndex === i && <div class="winner-ring" />}
            {phase === 'track' && <TrackMap path={opt.path} loop={opt.loop} index={i} />}
            <div class="poll-content">
              <div class="poll-title">{opt.label || opt.name}</div>
              <div class="poll-meta">
                {phase === 'track' ? (
                  <>
                    <span class="spz-inline-badge primary">{(opt.type || 'Circuit').toUpperCase()}</span>
                    <span class="spz-inline-badge">{opt.laps || 3} Laps</span>
                    <span class="spz-inline-badge">{opt.checkpointCount || '?'} CPs</span>
                  </>
                ) : (
                  <>
                    <span class="spz-inline-badge primary">{(opt.subtext || opt.class || 'Class').toUpperCase()}</span>
                    {opt.stats?.map((s, j) => (
                      <span key={j} class="spz-inline-badge">{s.label}: {s.value}</span>
                    ))}
                  </>
                )}
              </div>
            </div>
            {votedIndex === i && <div class="poll-selected-bar" />}
          </div>
        ))}
      </div>

      <div class="poll-timer-wrap">
        <div class="spz-progress">
          <div class="spz-progress-fill" style={{ width: `${timer}%` }} />
        </div>
        <div class="poll-timer-meta">
          <span>Session Timer</span>
          <span style={{ color: timer < 20 ? '#FF3D55' : 'var(--gray-50)' }}>
            {Math.ceil((timer / 100) * duration)}s
          </span>
        </div>
      </div>
    </div>
  )
}
