import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
}

export const Skeleton = ({
  width,
  height,
  variant = 'rect',
  className = ''
}: SkeletonProps) => {
  const styles = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`spz-skeleton ${variant} ${className}`} 
      style={styles}
    />
  );
};
