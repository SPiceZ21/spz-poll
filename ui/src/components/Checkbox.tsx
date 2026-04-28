import './Checkbox.css';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}: CheckboxProps) => {
  return (
    <label className={`spz-checkbox-container ${className} ${disabled ? 'disabled' : ''}`}>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e: any) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="checkbox-mark">
          {checked && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};
