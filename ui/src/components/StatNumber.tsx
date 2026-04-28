import './StatNumber.css';

interface StatNumberProps {
  value: string | number;
  label?: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const StatNumber = ({
  value,
  label,
  unit,
  trend,
  trendValue,
  size = 'md',
  className = ''
}: StatNumberProps) => {
  return (
    <div className={`spz-stat ${size} ${className}`}>
      {label && <span className="stat-label">{label}</span>}
      <div className="stat-value-group">
        <span className="stat-value">{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {trend && trendValue && (
        <span className={`stat-trend ${trend}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''} {trendValue}
        </span>
      )}
    </div>
  );
};
