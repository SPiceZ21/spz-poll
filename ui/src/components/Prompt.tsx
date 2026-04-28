import './Prompt.css';

// Map common key names to their symbols
const KEY_SYMBOLS: Record<string, string> = {
  CMD:   '⌘',
  SHIFT: '⇧',
  ALT:   '⌥',
  OPT:   '⌥',
  CTRL:  '⌃',
  TAB:   '⇥',
  CAPS:  '⇪',
  ESC:   '⎋',
  DEL:   '⌫',
  ENTER: '↵',
  UP:    '↑',
  DOWN:  '↓',
  LEFT:  '←',
  RIGHT: '→',
  SPACE: '␣',
};

const SYMBOL_KEYS = new Set(Object.keys(KEY_SYMBOLS));

function resolveKey(key: string) {
  const upper = key.toUpperCase();
  return {
    display: KEY_SYMBOLS[upper] ?? key,
    isSymbol: SYMBOL_KEYS.has(upper),
  };
}

interface KeycapProps {
  keys: string[];
  size?: 'sm' | 'md';
  className?: string;
}

export const Keycap = ({ keys, size = 'md', className = '' }: KeycapProps) => (
  <div className={`spz-keycap-group ${className}`}>
    {keys.map((key, i) => {
      const { display, isSymbol } = resolveKey(key);
      return (
        <>
          {i > 0 && <span key={`sep-${i}`} className="spz-keycap-sep">+</span>}
          <kbd
            key={i}
            className={`spz-keycap ${isSymbol ? 'symbol' : ''} ${size}`}
          >
            {display}
          </kbd>
        </>
      );
    })}
  </div>
);

interface PromptProps {
  label: string;
  keys?: string[];
  button?: 'A' | 'B' | 'X' | 'Y' | 'RT' | 'LT' | 'RB' | 'LB';
  className?: string;
}

export const Prompt = ({ label, keys, button, className = '' }: PromptProps) => (
  <div className={`spz-prompt ${className}`}>
    <div className="prompt-trigger">
      {keys && <Keycap keys={keys} />}
      {button && (
        <Keycap keys={[button]} />
      )}
    </div>
    <span className="prompt-label">{label}</span>
  </div>
);
