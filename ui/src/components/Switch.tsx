import './Switch.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}: SwitchProps) => {
  return (
    <label className={`spz-switch-container ${className} ${disabled ? 'disabled' : ''}`}>
      {label && <span className="switch-label">{label}</span>}
      <div className="switch-wrapper">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e: any) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="switch-slider"></span>
      </div>
    </label>
  );
};
