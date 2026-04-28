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
}

export function App() {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<'track' | 'vehicle'>('track')
  const [options, setOptions] = useState<PollOption[]>([])
  const [duration, setDuration] = useState(30)
  const [timer, setTimer] = useState(100)
  const [votedIndex, setVotedIndex] = useState(-1)
  const [winnerIndex, setWinnerIndex] = useState(-1)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data?.action) return
      const { action, data = {} } = e.data
      if (action === 'openPoll') {
        setPhase(data.phase || 'track')
        setOptions(data.options || [])
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

  const vote = (idx: number) => {
    if (votedIndex !== -1 || winnerIndex !== -1) return
    setVotedIndex(idx)
    fetch(`https://${GetParentResourceName()}/pollVote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: idx + 1 }),
    }).catch(() => {})
  }

  if (!visible) return null

  return (
    <div class="poll-overlay">
      <div class="poll-header">
        <div class="poll-phase-label">
          {phase === 'track' ? 'Track Selection' : 'Vehicle Selection'}
        </div>
        <h1 class="poll-main-title">
          {phase === 'track' ? 'Choose Your Path' : 'Select Performance'}
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
