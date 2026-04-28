import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressBar = ({
  value,
  max = 100,
  variant = 'primary',
  label,
  showValue = false,
  className = ''
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`spz-progress-container ${className}`}>
      {(label || showValue) && (
        <div className="progress-info">
          {label && <span className="progress-label">{label}</span>}
          {showValue && <span className="progress-value">{value}%</span>}
        </div>
      )}
      <div className="progress-track">
        <div 
          className={`progress-fill ${variant}`} 
          style={{ width: `${percentage}%` }}
        >
          <div className="progress-glow"></div>
        </div>
      </div>
    </div>
  );
};
