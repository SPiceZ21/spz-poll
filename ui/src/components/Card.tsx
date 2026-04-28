import './Card.css';

interface CardProps {
  children: any;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'glass' | 'outline';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  className = ''
}: CardProps) => {
  return (
    <div className={`spz-card ${variant} p-${padding} ${className}`}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};
