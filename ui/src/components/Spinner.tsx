import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gray';
  className?: string;
}

export const Spinner = ({
  size = 'md',
  variant = 'primary',
  className = ''
}: SpinnerProps) => {
  return (
    <div className={`spz-spinner ${size} ${variant} ${className}`}>
      <div className="spinner-inner"></div>
    </div>
  );
};
