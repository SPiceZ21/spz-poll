import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import * as Icons from 'lucide-preact';
import './RadialMenu.css';

export interface RadialMenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

interface RadialMenuProps {
  isOpen: boolean;
  items: RadialMenuItem[];
  onClose: () => void;
}

export const RadialMenu = ({ isOpen, items, onClose }: RadialMenuProps) => {
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const menuItems = useMemo(() => {
    const hexWidth = 100;
    const hexHeight = 115;
    const horizontalSpacing = hexWidth + 8; // Small gap
    const verticalSpacing = (hexHeight * 0.75) + 8; // Honeycomb vertical offset

    const rows: RadialMenuItem[][] = [];
    let currentItems = [...items];
    
    // Distribute items into rows (alternate 4, 3, 4, 3...)
    let rowSize = 4;
    while (currentItems.length > 0) {
      rows.push(currentItems.splice(0, rowSize));
      rowSize = rowSize === 4 ? 3 : 4;
    }

    const positionedItems: any[] = [];
    rows.forEach((row, rowIndex) => {
      const isOffsetRow = rowSize === 4 ? rowIndex % 2 !== 0 : rowIndex % 2 !== 0; 
      // Fixed logic: if row 1 has 4, row 2 has 3 (offset).
      // If row.length is 3, it should be offset.
      const rowOffset = row.length === 3 ? (hexWidth + 8) / 2 : 0;
      
      const totalWidth = (row.length - 1) * horizontalSpacing;
      const startX = -totalWidth / 2;

      row.forEach((item, itemIndex) => {
        positionedItems.push({
          ...item,
          tx: `${startX + (itemIndex * horizontalSpacing) + (row.length === 3 ? 0 : 0)}px`, // startX already centers it
          // Wait, startX + rowOffset would move it right.
          // Actually if Row 1 has 4 and Row 2 has 3, Row 2 items should be between Row 1 items.
          tx_final: `${startX + (itemIndex * horizontalSpacing)}px`,
          ty_final: `${rowIndex * verticalSpacing - ((rows.length - 1) * verticalSpacing) / 2}px`,
        });
      });
    });

    return {
      items: positionedItems,
      totalHeight: (rows.length - 1) * verticalSpacing
    };
  }, [items]);

  const IconComponent = (iconName: string) => {
    const LucideIcon = (Icons as any)[iconName] || Icons.HelpCircle;
    return <LucideIcon className="radial-menu-item-icon" />;
  };

  return (
    <div className={`radial-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="radial-menu-container" onClick={(e) => e.stopPropagation()}>
        {menuItems.items.map((item) => (
          <div
            key={item.id}
            className={`radial-menu-item ${activeIndex === item.id ? 'active' : ''}`}
            style={{ '--tx': item.tx_final, '--ty': item.ty_final } as any}
            onMouseEnter={() => setActiveIndex(item.id)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            {IconComponent(item.icon)}
            <span className="radial-menu-item-label">{item.label}</span>
          </div>
        ))}

        <div 
          className="radial-menu-close" 
          style={{ '--ty': `${(menuItems.totalHeight / 2) + 90}px` } as any}
          onClick={onClose}
        >
          <Icons.X size={24} />
          <span className="radial-menu-close-label">Close</span>
        </div>
      </div>
    </div>
  );
};
