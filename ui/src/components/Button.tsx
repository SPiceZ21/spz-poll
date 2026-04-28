import './Button.css';

interface ButtonProps {
  children: any;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick
}: ButtonProps) => {
  return (
    <button
      className={`spz-button ${variant} ${size} ${className} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="loader"></span>
      ) : children}
    </button>
  );
};
