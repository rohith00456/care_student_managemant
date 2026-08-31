import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'ai-analyst', label: 'Vision AI', icon: 'center_focus_strong' },
    { id: 'exercises', label: 'Exercises', icon: 'fitness_center' },
    { id: 'wellness', label: 'Wellness', icon: 'spa' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-[72px] glass-panel bg-black/70 px-2 pb-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id || (activeTab === 'spine3d' && tab.id === 'home') || (activeTab === 'debug' && tab.id === 'settings');
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-90 ${
              isActive
                ? 'text-[var(--accent-cyan)] font-bold text-glow-cyan'
                : 'text-gray-500 hover:text-[var(--accent-cyan)]'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${isActive ? 'animate-pulse' : ''}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium leading-tight mt-1 uppercase tracking-widest">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-8 h-1 bg-[var(--accent-cyan)] rounded-full shadow-[0_0_10px_var(--accent-cyan-glow)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

