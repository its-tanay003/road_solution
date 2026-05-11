import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from 'i18next';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type FontWeight = 'normal' | 'bold';
export type LetterSpacing = 'normal' | 'spaced';
export type Theme = 'dark' | 'light' | 'high-contrast' | 'saffron';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';

interface AccessibilityState {
  // Appearance
  fontSize: FontSize;
  fontWeight: FontWeight;
  letterSpacing: LetterSpacing;
  theme: Theme;
  language: Language;
  
  // Modes
  simplifiedMode: boolean;
  deafMode: boolean;
  highStressMode: boolean;
  highStressAutoActivate: boolean;
  hapticEnabled: boolean;
  voiceNavEnabled: boolean;
  ttsEnabled: boolean;
  isReducedMotion: boolean;
  isDyslexic: boolean;
  isHighContrast: boolean;
  isSimpleLanguage: boolean;
  
  // SOS Specific
  sosTriggerMode: 'hold' | 'tap' | 'voice';
  onboardingComplete: boolean;
  
  // Status
  lastAnnouncement: string;
  soundMonitorActive: boolean;
  
  // Actions
  setFontSize: (size: FontSize) => void;
  setFontWeight: (weight: FontWeight) => void;
  setLetterSpacing: (spacing: LetterSpacing) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setSimplifiedMode: (mode: boolean) => void;
  setDeafMode: (mode: boolean) => void;
  setHighStressMode: (mode: boolean) => void;
  setHighStressAutoActivate: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setVoiceNavEnabled: (enabled: boolean) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setLastAnnouncement: (text: string) => void;
  setSoundMonitorActive: (active: boolean) => void;
  setReducedMotion: (val: boolean) => void;
  setDyslexic: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setSimpleLanguage: (val: boolean) => void;
  setSosTriggerMode: (mode: 'hold' | 'tap' | 'voice') => void;
  setOnboardingComplete: (val: boolean) => void;
  
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
  deafMode: false,
  highStressMode: false,
  highStressAutoActivate: true,
  hapticEnabled: true,
  voiceNavEnabled: true,
  ttsEnabled: true,
  isReducedMotion: false,
  isDyslexic: false,
  isHighContrast: false,
  isSimpleLanguage: false,
  sosTriggerMode: 'hold' as const,
  onboardingComplete: false,
  lastAnnouncement: '',
  soundMonitorActive: false,
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
      setDeafMode: (deafMode) => set({ deafMode }),
      setHighStressMode: (highStressMode) => set({ highStressMode }),
      setHighStressAutoActivate: (highStressAutoActivate) => set({ highStressAutoActivate }),
      setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
      setVoiceNavEnabled: (voiceNavEnabled) => set({ voiceNavEnabled }),
      setTtsEnabled: (ttsEnabled) => set({ ttsEnabled }),
      setLastAnnouncement: (lastAnnouncement) => set({ lastAnnouncement }),
      setSoundMonitorActive: (soundMonitorActive) => set({ soundMonitorActive }),
      setReducedMotion: (isReducedMotion) => set({ isReducedMotion }),
      setDyslexic: (isDyslexic) => set({ isDyslexic }),
      setHighContrast: (isHighContrast) => set({ isHighContrast }),
      setSimpleLanguage: (isSimpleLanguage) => set({ isSimpleLanguage }),
      setSosTriggerMode: (sosTriggerMode) => set({ sosTriggerMode }),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
      
      resetToDefaults: () => {
        set(DEFAULT_STATE);
        get().applySettings(DEFAULT_STATE);
      },

      applySettings: (state) => {
        const root = document.documentElement;
        
        if (state.fontSize) {
          root.style.setProperty('--app-font-size', fontSizeMap[state.fontSize]);
        }
        
        if (state.fontWeight) {
          root.style.setProperty('--app-font-weight', state.fontWeight === 'bold' ? '600' : '400');
        }
        
        if (state.letterSpacing) {
          root.style.setProperty('--app-letter-spacing', state.letterSpacing === 'spaced' ? '0.05em' : 'normal');
        }
        
        if (state.theme) {
          root.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast', 'theme-saffron');
          root.classList.add(`theme-${state.theme}`);
          root.setAttribute('data-theme', state.theme);
        }
        
        if (state.isReducedMotion !== undefined) {
          root.setAttribute('data-reduce-motion', String(state.isReducedMotion));
        }

        if (state.isHighContrast !== undefined) {
          root.setAttribute('data-high-contrast', String(state.isHighContrast));
        }

        if (state.language) {
          if (i18n.language !== state.language) {
            i18n.changeLanguage(state.language);
          }
        }
      }
    }),
    {
      name: 'roadsos-accessibility-v2',
      onRehydrateStorage: () => (state) => {
        if (state) state.applySettings(state);
      }
    }
  )
);

useAccessibilityStore.subscribe((state) => {
  state.applySettings(state);
});
