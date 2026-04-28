import { Card } from './Card';
import { StatNumber } from './StatNumber';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: any;
  variant?: 'default' | 'glass' | 'outline';
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon: Icon,
  variant = 'glass',
  className = ''
}: StatsCardProps) => {
  return (
    <Card variant={variant} className={`spz-stats-card ${className}`}>
      <div className="stats-card-inner">
        <div className="stats-card-main">
          <StatNumber 
            value={value} 
            unit={unit} 
            label={title} 
            trend={trend} 
            trendValue={trendValue}
            size="lg"
          />
        </div>
        {Icon && (
          <div className="stats-card-icon">
            <Icon size={32} />
          </div>
        )}
      </div>
    </Card>
  );
};
