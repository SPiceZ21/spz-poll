interface StackProps {
  children: any;
  direction?: 'row' | 'col';
  gap?: 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
  wrap?: boolean;
}

export const Stack = ({
  children,
  direction = 'col',
  gap = 12,
  align = 'stretch',
  justify = 'start',
  className = '',
  wrap = false
}: StackProps) => {
  const styles = {
    display: 'flex',
    flexDirection: direction === 'col' ? 'column' : 'row',
    gap: `var(--spacing-${gap})`,
    alignItems: align,
    justifyContent: justify === 'between' ? 'space-between' : justify === 'around' ? 'space-around' : justify,
    flexWrap: wrap ? 'wrap' : 'nowrap'
  };

  return (
    <div className={`spz-stack ${className}`} style={styles}>
      {children}
    </div>
  );
};
