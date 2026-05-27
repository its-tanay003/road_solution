'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sun, Moon, Laptop, Check, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export function HeaderControls() {
  const { i18n } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trap focus inside language selector dropdown when open (WCAG Focus Trap)
  React.useEffect(() => {
    if (!dropdownOpen) return;

    // Auto focus first option on open
    const timer = setTimeout(() => {
      if (!dropdownRef.current) return;
      const options = Array.from(
        dropdownRef.current.querySelectorAll('button:not([aria-label="Select language"])')
      ) as HTMLElement[];
      if (options.length > 0) {
        options[0].focus();
      }
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (!dropdownRef.current) return;
      const focusables = Array.from(
        dropdownRef.current.querySelectorAll('button:not([aria-label="Select language"]), a, [tabindex="0"]')
      ) as HTMLElement[];
      if (focusables.length === 0) return;
      
      const active = document.activeElement as HTMLElement;
      const index = focusables.indexOf(active);
      
      if (e.shiftKey) {
        if (index <= 0) {
          focusables[focusables.length - 1].focus();
        } else {
          focusables[index - 1].focus();
        }
      } else {
        if (index === -1 || index >= focusables.length - 1) {
          focusables[0].focus();
        } else {
          focusables[index + 1].focus();
        }
      }
      e.preventDefault();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    void i18n.changeLanguage(code);
    setDropdownOpen(false);
  };

  // Cycle theme: light -> dark -> system -> light
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const renderThemeIcon = () => {
    if (theme === 'light') return <Sun size={18} className="text-amber-400 rotate-0 transition-transform duration-300" />;
    if (theme === 'dark') return <Moon size={18} className="text-indigo-400 rotate-0 transition-transform duration-300" />;
    return <Laptop size={18} className="text-teal-400 transition-transform duration-300" />;
  };

  return (
    <div className="flex items-center gap-1.5 relative z-50">
      {/* Notifications Button */}
      <button
        onClick={() => {
          if ('Notification' in window) {
            Notification.requestPermission();
          }
        }}
        aria-label="Push Notifications"
        className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-900/60 border border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700/80 active:scale-95 transition-all shadow-sm"
      >
        <Bell size={18} className="text-blue-400" />
      </button>

      {/* Quick Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        aria-label={`Cycle theme, current: ${theme}`}
        className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-900/60 border border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700/80 active:scale-95 transition-all shadow-sm"
      >
        {renderThemeIcon()}
      </button>

      {/* Language Globe Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-label="Select language"
          className={cn(
            "h-11 px-3 gap-1.5 rounded-xl flex items-center justify-center bg-gray-900/60 border border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700/80 active:scale-95 transition-all shadow-sm min-w-[44px]",
            dropdownOpen && "border-red-500/50 text-white bg-gray-900"
          )}
        >
          <Globe size={18} className={cn("transition-transform duration-300", dropdownOpen && "rotate-45 text-red-400")} />
          <span className="text-xs font-bold uppercase tracking-tight hidden xs:inline">
            {currentLang.code}
          </span>
          <span className="text-xs">{currentLang.flag}</span>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-gray-950 border border-gray-800/90 shadow-2xl p-1.5 divide-y divide-gray-900 max-h-[350px] overflow-y-auto no-scrollbar"
            >
              <div className="py-1">
                {LANGUAGES.map((lang) => {
                  const active = i18n.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm font-medium transition-all",
                        active 
                          ? "bg-red-950/20 text-red-400 border border-red-900/20" 
                          : "text-gray-400 hover:text-white hover:bg-gray-900/60 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base select-none" role="img" aria-label={`${lang.name} flag`}>
                          {lang.flag}
                        </span>
                        <span className="font-semibold tracking-tight leading-none">
                          {lang.name}
                        </span>
                      </div>
                      {active && (
                        <Check size={14} className="text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
