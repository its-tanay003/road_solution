import React from 'react';
import { HUDBar } from './HUDBar';
import { Navigation } from './Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IndiaStatsTicker } from './IndiaStatsTicker';
import { ImpactBanner } from './ImpactBanner';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSettingsClick?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeTab = 'home', 
  onTabChange = () => {},
  onSettingsClick = () => {} 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-night">
      <IndiaStatsTicker />
      <HUDBar onSettingsClick={onSettingsClick} />
      <ImpactBanner />
      
      <main className="flex-1 flex flex-col mt-[100px] pb-[72px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
