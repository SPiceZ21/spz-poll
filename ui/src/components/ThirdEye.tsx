import { h, Fragment } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import * as Icons from 'lucide-preact';
import './ThirdEye.css';

export interface ThirdEyeOption {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

/**
 * The interactive "Eye" icon (Target)
 */
interface ThirdEyeTargetProps {
  visible: boolean;
  isOpen: boolean;
  onClick: () => void;
}

export const ThirdEyeTarget = ({ visible, isOpen, onClick }: ThirdEyeTargetProps) => {
  return (
    <div 
      className={`third-eye-icon-wrapper ${visible ? 'visible' : ''} ${isOpen ? 'open' : ''}`}
      onClick={onClick}
    >
      <Icons.Eye size={24} />
      <div className="third-eye-dot" style={{ top: '20%', right: '20%' }} />
    </div>
  );
};

/**
 * The menu that appears next to the target
 */
interface ThirdEyeMenuProps {
  isOpen: boolean;
  options: ThirdEyeOption[];
  onSelect: (option: ThirdEyeOption) => void;
}

export const ThirdEyeMenu = ({ isOpen, options, onSelect }: ThirdEyeMenuProps) => {
  const IconComponent = (iconName: string) => {
    const LucideIcon = (Icons as any)[iconName] || Icons.HelpCircle;
    return <LucideIcon className="third-eye-option-icon" />;
  };

  return (
    <div className={`third-eye-menu ${isOpen ? 'open' : ''}`}>
      {options.map((option) => (
        <div
          key={option.id}
          className={`third-eye-option ${option.disabled ? 'disabled' : ''}`}
          onClick={() => !option.disabled && onSelect(option)}
        >
          {IconComponent(option.icon)}
          <span>{option.label}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Combined ThirdEye Component
 */
interface ThirdEyeProps {
  visible: boolean;
  isOpen: boolean;
  options: ThirdEyeOption[];
  onToggle: (state: boolean) => void;
}

export const ThirdEye = ({ visible, isOpen, options, onToggle }: ThirdEyeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div 
      ref={containerRef}
      className={`third-eye-container ${visible ? 'visible' : ''} ${isOpen ? 'open' : ''}`}
    >
      <ThirdEyeTarget 
        visible={visible} 
        isOpen={isOpen} 
        onClick={() => onToggle(!isOpen)} 
      />
      
      <ThirdEyeMenu 
        isOpen={isOpen} 
        options={options} 
        onSelect={(opt) => {
          opt.action();
          onToggle(false);
        }} 
      />
    </div>
  );
};
