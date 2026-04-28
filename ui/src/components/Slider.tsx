import './Slider.css';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  disabled = false,
  className = ''
}: SliderProps) => {
  return (
    <div className={`spz-slider-container ${className} ${disabled ? 'disabled' : ''}`}>
      <div className="slider-header">
        {label && <label className="slider-label">{label}</label>}
        <span className="slider-value">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e: any) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="slider-input"
      />
    </div>
  );
};
