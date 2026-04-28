import { useEffect } from 'preact/hooks';
import { Card } from './Card';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: any;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="spz-modal-overlay" onClick={onClose}>
      <div 
        className={`spz-modal-container ${size} ${className}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <Card 
          title={title} 
          variant="glass" 
          padding="lg"
          className="modal-card"
        >
          <button className="modal-close" onClick={onClose}>×</button>
          <div className="modal-body">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};
