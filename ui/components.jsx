/** @jsx h */
const { h } = preact;
const { useRef, useEffect } = preactHooks;

function Icon({ name, size = 14, strokeWidth = 1.75, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) window.lucide.createIcons({ nameAttr: 'data-lucide', icons: window.lucide.icons, attrs: {}, });
  }, [name]);
  return (
    <i
      ref={ref}
      data-lucide={name}
      style={{ width: size, height: size, display: 'inline-flex', strokeWidth }}
      {...rest}
    />
  );
}

function Badge({ variant, children, ...rest }) {
  return <span className="spz-badge" data-variant={variant} {...rest}>{children}</span>;
}

function Progress({ value = 0 }) {
  return (
    <div className="spz-progress">
      <div className="spz-progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

window.Badge = Badge;
window.Progress = Progress;
window.Icon = Icon;
