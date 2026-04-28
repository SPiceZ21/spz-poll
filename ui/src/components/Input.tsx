import './Input.css';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: any) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  icon?: any;
}

export const Input = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  className = '',
  disabled = false,
  icon: Icon
}: InputProps) => {
  return (
    <div className={`spz-input-wrapper ${className} ${error ? 'has-error' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-control">
        {Icon && <Icon className="input-icon" size={18} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onInput={onChange}
          disabled={disabled}
          className="input-field"
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};
