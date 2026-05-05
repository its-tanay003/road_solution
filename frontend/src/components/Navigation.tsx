import React from 'react';
import { Home, Map, MessageSquare, BarChart2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'ai', icon: MessageSquare, label: 'AI Chat' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="h-[72px] glass-dark fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-item flex-1 h-full flex flex-col items-center justify-center gap-1 ${isActive ? 'active' : ''}`}
          >
            <div className="relative">
              <Icon size={24} />
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan rounded-full"
                />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
