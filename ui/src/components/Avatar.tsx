import './Avatar.css'

interface AvatarProps {
  name?: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away'
  className?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const Avatar = ({
  name = '',
  src,
  size = 'md',
  status,
  className = '',
}: AvatarProps) => (
  <div className={`spz-avatar ${size} ${className}`}>
    <div className="avatar-content">
      {src
        ? <img src={src} alt={name} className="avatar-img" />
        : <span>{getInitials(name)}</span>
      }
    </div>
    {status && <span className={`status-indicator ${status}`} />}
  </div>
)

// ─── Avatar Group ───────────────────────────────────────────────────────────

interface AvatarGroupProps {
  avatars: AvatarProps[]
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const AvatarGroup = ({
  avatars,
  max = 4,
  size = 'sm',
  className = '',
}: AvatarGroupProps) => {
  const shown = avatars.slice(0, max)
  const overflow = avatars.length - shown.length

  return (
    <div className={`spz-avatar-group ${className}`}>
      {shown.map((av, i) => (
        <Avatar key={i} {...av} size={size} />
      ))}
      {overflow > 0 && (
        <div className={`avatar-overflow ${size}`}>
          +{overflow}
        </div>
      )}
    </div>
  )
}
