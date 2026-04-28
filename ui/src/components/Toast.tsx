import { useState, useEffect } from 'preact/hooks';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-preact';
import './Toast.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType     = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastItem {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
  duration?: number;           // ms, 0 = sticky
  position?: ToastPosition;
}

// ─── Single Toast ─────────────────────────────────────────────────────────────

const TYPE_ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => {
  const Icon = TYPE_ICONS[toast.type];

  useEffect(() => {
    const dur = toast.duration ?? 4000;
    if (dur === 0) return;
    const t = setTimeout(() => onClose(toast.id), dur);
    return () => clearTimeout(t);
  }, [toast.id]);

  return (
    <div className={`spz-toast ${toast.type}`}>
      <span className="toast-icon">
        <Icon size={16} strokeWidth={2.5} />
      </span>
      <div className="toast-body">
        <span className="toast-title">{toast.title}</span>
        {toast.message && <span className="toast-message">{toast.message}</span>}
      </div>
      <button className="toast-close" onClick={() => onClose(toast.id)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
};

// ─── Toaster (position container) ─────────────────────────────────────────────

interface ToasterProps {
  toasts:   ToastItem[];
  onClose:  (id: string) => void;
  position: ToastPosition;
}

export const Toaster = ({ toasts, onClose, position }: ToasterProps) => {
  const byPos = toasts.filter(t => (t.position ?? 'top-right') === position);
  if (!byPos.length) return null;

  return (
    <div className={`spz-toaster ${position}`}>
      {byPos.map(t => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};

// ─── useToast hook ─────────────────────────────────────────────────────────────

let _setToasts: ((fn: (prev: ToastItem[]) => ToastItem[]) => void) | null = null;

export function toast(item: Omit<ToastItem, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  _setToasts?.((prev) => [...prev, { ...item, id }]);
}

export function useToastStore() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  _setToasts = setToasts;

  const remove = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  return { toasts, remove };
}

// All positions to render Toasters for
export const ALL_POSITIONS: ToastPosition[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];
