import './IconButton.css';

interface IconButtonProps {
  icon: any; // Lucide icon component
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  label?: string; // For accessibility
}

export const IconButton = ({
  icon: Icon,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  label
}: IconButtonProps) => {
  return (
    <button
      className={`spz-icon-button ${variant} ${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
    >
      <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
    </button>
  );
};
