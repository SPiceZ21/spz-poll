import "./Input.css";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: any) => void;
  onInput?: (e: any) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  icon?: any;
  style?: any;
  autoFocus?: boolean;
}

export const Input = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onInput,
  error,
  className = "",
  disabled = false,
  icon: Icon,
  style,
  autoFocus,
}: InputProps) => {
  return (
    <div className={`spz-input-wrapper ${className} ${error ? "has-error" : ""}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-control">
        {Icon && <Icon className="input-icon" size={18} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onInput={onInput || onChange}
          disabled={disabled}
          className="input-field" style={style} autoFocus={autoFocus}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};




