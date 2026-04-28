import { useState } from 'preact/hooks';
import './Tabs.css';

interface Tab {
  id: string;
  label: string;
  icon?: any;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className = ''
}: TabsProps) => {
  return (
    <div className={`spz-tabs-container ${variant} ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`spz-tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {Icon && <Icon size={16} className="tab-icon" />}
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
