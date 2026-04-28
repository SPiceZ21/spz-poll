import './Separator.css';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator = ({
  orientation = 'horizontal',
  className = ''
}: SeparatorProps) => {
  return (
    <div className={`spz-separator ${orientation} ${className}`} role="separator" />
  );
};
