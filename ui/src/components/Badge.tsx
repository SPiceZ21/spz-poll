import './Badge.css';

interface BadgeProps {
  children: any;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = ''
}: BadgeProps) => {
  return (
    <span className={`spz-badge ${variant} ${size} ${className}`}>
      {children}
    </span>
  );
};
