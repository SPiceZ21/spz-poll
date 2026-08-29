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

   The map underneath is Rockstar's own Social Club tile set, fetched at runtime
   (256px tiles, zoom 0-6, doubling each level: z4 is 8x12 tiles = 2048x3072).
   Only the tiles covering the track are requested, at the zoom level closest to
   the card's own resolution. Tiles are optional — if they fail (no connectivity,
   server moved) the plot falls back to a grid, which is why the route, the start
   marker and the frame are all drawn independently of the image. */

interface MapSpec {
  url: string        // {z}/{x}/{y} tile template
  s: number          // z4 map pixels per game metre
  ox: number         // z4 map px at world X 0
  oy: number         // z4 map px at world Y 0 (Y is flipped: +Y north is up)
  minZ: number
  maxZ: number
}
// Calibrated against 6428 checkpoints from the tracks in this repo: the affine
// that puts the most checkpoints on road pixels. Peak is sharp — score drops
// ~6% at ±33 m — so this is the fit, not a plateau. 1 z4 pixel = 4.12 m.
const DEFAULT_MAP: MapSpec = {
  url: 'https://s.rsg.sc/sc/images/games/GTAV/map/game/{z}/{x}/{y}.jpg',
  s: 0.2428,
  ox: 780.13,
  oy: 1945.38,
  // Below z2 the grid stops being an exact halving (z1 is 1x2, z0 is 1x1, both
  // padded), so the affine no longer lines up — z2 is the widest usable level.
  minZ: 2,
  maxZ: 6,
}
// Overridable from the openPoll payload (data.map) — a different tile set or a
// re-calibration needs no UI rebuild.
let MAP: MapSpec = DEFAULT_MAP

// z4 grid is 8x12 tiles; every level up doubles both axes.
const tilesX = (z: number) => Math.ceil(8 * Math.pow(2, z - 4))
const tilesY = (z: number) => Math.ceil(12 * Math.pow(2, z - 4))

const VIEW_W = 248
const VIEW_H = 140

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
  // Tiles drop out individually; the grid only takes over once none loaded, so
  // one bad tile never costs the whole map.
  const [dead, setDead] = useState<Record<string, true>>({})
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
  const pad = 0.1
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
  const mapFxId = `mapfx${index}`

  /* Tile layer. Pick the zoom whose pixels are closest to the card's own, so a
     tight sprint pulls sharp tiles and a cross-map circuit does not fetch
     hundreds of them; then request only the tiles the card actually shows. */
  const zoom = Math.max(MAP.minZ, Math.min(MAP.maxZ,
    Math.round(4 + Math.log2(Math.max(scale / MAP.s, 1e-6)))))
  const k = Math.pow(2, zoom - 4)          // map px per z4 px at this zoom
  const f = scale / (MAP.s * k)            // card px per map px at this zoom
  // Card px for a given map px, on both axes (the two are the same affine).
  const cardX = (mp: number) => px((mp / k - MAP.ox) / MAP.s)
  const cardY = (mp: number) => py((MAP.oy - mp / k) / MAP.s)
  const tiles: { key: string; href: string; x: number; y: number }[] = []
  const tx0 = Math.max(0, Math.floor((0 - cardX(0)) / (256 * f)))
  const tx1 = Math.min(tilesX(zoom) - 1, Math.floor((VIEW_W - cardX(0)) / (256 * f)))
  const ty0 = Math.max(0, Math.floor((0 - cardY(0)) / (256 * f)))
  const ty1 = Math.min(tilesY(zoom) - 1, Math.floor((VIEW_H - cardY(0)) / (256 * f)))
  for (let tx = tx0; tx <= tx1; tx++) {
    for (let ty = ty0; ty <= ty1; ty++) {
      const key = `${zoom}/${tx}/${ty}`
      if (dead[key]) continue
      tiles.push({
        key,
        href: MAP.url.replace('{z}', String(zoom)).replace('{x}', String(tx)).replace('{y}', String(ty)),
        x: cardX(tx * 256),
        y: cardY(ty * 256),
      })
    }
  }

  return (
    <div class="poll-map">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <clipPath id={clipId}><rect x="0" y="0" width={VIEW_W} height={VIEW_H} /></clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="var(--color-primary)" />
            <stop offset="100%" stop-color="var(--color-secondary, var(--color-primary))" />
          </linearGradient>
          {/* Social Club tiles are a bright paper map; knock them back so they
              read as terrain under the route rather than competing with it. */}
          <filter id={mapFxId} color-interpolation-filters="sRGB">
            <feColorMatrix type="saturate" values="0.25" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.30" intercept="0.015" />
              <feFuncG type="linear" slope="0.32" intercept="0.025" />
              <feFuncB type="linear" slope="0.38" intercept="0.045" />
            </feComponentTransfer>
          </filter>
        </defs>

        <g clip-path={`url(#${clipId})`}>
          {tiles.length > 0 && (
            <g filter={`url(#${mapFxId})`}>
              {tiles.map(t => (
                <image
                  key={t.key}
                  href={t.href}
                  x={t.x}
                  y={t.y}
                  width={256 * f + 0.5}   /* half-pixel bleed hides seams */
                  height={256 * f + 0.5}
                  preserveAspectRatio="none"
                  onError={() => setDead(prev => ({ ...prev, [t.key]: true }))}
                />
              ))}
            </g>
          )}
          {/* No tiles: a 200 m grid pinned to world coordinates, so the plot
              still carries a sense of scale and of the track drifting across
              the world as it turns. */}
          {tiles.length === 0 && gridLines(minX, maxX, minY, maxY, px, py)}

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
        MAP = { ...DEFAULT_MAP, ...(data.map || {}) }
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
      <div class="poll-stack">
        <div class="poll-header">
          <div class="poll-phase-label">
            {phase === 'track' ? 'Track' : phase === 'traffic' ? 'Traffic' : 'Vehicle'}
          </div>
          <h1 class="poll-main-title">
            {phase === 'track' ? 'Choose Your Path' : phase === 'traffic' ? 'Set Road Density' : 'Select Performance'}
          </h1>
          <span class="poll-countdown" data-urgent={timer < 20}>
            {Math.ceil((timer / 100) * duration)}s
          </span>
        </div>

        <div class="poll-timer-track">
          <div class="poll-timer-fill" style={{ width: `${timer}%` }} />
        </div>

        <div class="poll-options">
        {options.map((opt, i) => (
          /* Map and details are two separate cards: the plot is a picture, the
             details are text, and stacking them as one block made the text read
             as a caption burnt into the map. */
          <div
            key={i}
            class="poll-option"
            data-selected={votedIndex === i}
            onClick={() => vote(i)}
          >
            {phase === 'track' && opt.path && opt.path.length > 1 && (
              <div class="poll-card poll-card-map">
                <span class="poll-bg-num">{i + 1}</span>
                {winnerIndex === i && <div class="winner-ring" />}
                <TrackMap path={opt.path} loop={opt.loop} index={i} />
              </div>
            )}
            <div class="poll-card poll-content">
              {!(phase === 'track' && opt.path && opt.path.length > 1) && (
                <>
                  <span class="poll-bg-num">{i + 1}</span>
                  {winnerIndex === i && <div class="winner-ring" />}
                </>
              )}
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
              {votedIndex === i && <div class="poll-selected-bar" />}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
