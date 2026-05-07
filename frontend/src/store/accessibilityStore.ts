import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from 'i18next';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type FontWeight = 'normal' | 'bold';
export type LetterSpacing = 'normal' | 'spaced';
export type Theme = 'dark' | 'light' | 'high-contrast' | 'saffron';
export type Language = 'en' | 'hi' | 'ta';

interface AccessibilityState {
  fontSize: FontSize;
  fontWeight: FontWeight;
  letterSpacing: LetterSpacing;
  theme: Theme;
  language: Language;
  simplifiedMode: boolean;
  
  setFontSize: (size: FontSize) => void;
  setFontWeight: (weight: FontWeight) => void;
  setLetterSpacing: (spacing: LetterSpacing) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setSimplifiedMode: (mode: boolean) => void;
  resetToDefaults: () => void;
  applySettings: (state: Partial<AccessibilityState>) => void;
}

const fontSizeMap = { 
  sm: '14px', 
  md: '16px', 
  lg: '20px', 
  xl: '24px', 
  xxl: '30px' 
};

const DEFAULT_STATE = {
  fontSize: 'md' as FontSize,
  fontWeight: 'normal' as FontWeight,
  letterSpacing: 'normal' as LetterSpacing,
  theme: 'dark' as Theme,
  language: 'en' as Language,
  simplifiedMode: false,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setFontSize: (fontSize) => set({ fontSize }),
      setFontWeight: (fontWeight) => set({ fontWeight }),
      setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language);
      },
      setSimplifiedMode: (simplifiedMode) => set({ simplifiedMode }),
      
      resetToDefaults: () => {
        set(DEFAULT_STATE);
        get().applySettings(DEFAULT_STATE);
      },

      applySettings: (state) => {
        const root = document.documentElement;
        
        // Font Size
        if (state.fontSize) {
          root.style.setProperty('--app-font-size', fontSizeMap[state.fontSize]);
        }
        
        // Font Weight
        if (state.fontWeight) {
          root.style.setProperty('--app-font-weight', state.fontWeight === 'bold' ? '600' : '400');
        }
        
        // Letter Spacing
        if (state.letterSpacing) {
          root.style.setProperty('--app-letter-spacing', state.letterSpacing === 'spaced' ? '0.05em' : 'normal');
        }
        
        // Theme
        if (state.theme) {
          root.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast', 'theme-saffron');
          root.classList.add(`theme-${state.theme}`);
        }
        
        // Language
        if (state.language) {
          if (i18n.language !== state.language) {
            i18n.changeLanguage(state.language);
          }
        }
      }
    }),
    {
      name: 'roadsos-accessibility',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.applySettings(state);
        }
      }
    }
  )
);
