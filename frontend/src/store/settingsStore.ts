import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark-hud' | 'dark-soft' | 'high-contrast' | 'light-clean';
export type TextSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl';
export type FontStyle = 'inter' | 'rajdhani' | 'atkinson';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';
export type SosMode = 'hold3s' | 'tap5x' | 'voice' | 'shake';
export type ColorScheme = 'default' | 'protanopia' | 'deuteranopia';

interface SettingsState {
  theme: Theme;
  textSize: TextSize;
  fontStyle: FontStyle;
  language: Language;
  reducedMotion: boolean;
  hapticFeedback: boolean;
  sosMode: SosMode;
  emergencyContact: string;
  colorScheme: ColorScheme;
  showTutorial: boolean;
  
  setTheme: (theme: Theme) => void;
  setTextSize: (size: TextSize) => void;
  setFontStyle: (font: FontStyle) => void;
  setLanguage: (lang: Language) => void;
  setReducedMotion: (val: boolean) => void;
  setHapticFeedback: (val: boolean) => void;
  setSosMode: (mode: SosMode) => void;
  setEmergencyContact: (contact: string) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setShowTutorial: (show: boolean) => void;
}

const fontSizeMap: Record<TextSize, string> = {
  small: '14px',
  medium: '16px',
  large: '20px',
  xl: '24px',
  xxl: '28px',
};

const fontFamilyMap: Record<FontStyle, string> = {
  inter: '"Inter", sans-serif',
  rajdhani: '"Rajdhani", sans-serif',
  atkinson: '"Atkinson Hyperlegible", sans-serif',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark-hud',
      textSize: 'medium',
      fontStyle: 'inter',
      language: 'en',
      reducedMotion: false,
      hapticFeedback: true,
      sosMode: 'hold3s',
      emergencyContact: '',
      colorScheme: 'default',
      showTutorial: true,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      setTextSize: (textSize) => {
        set({ textSize });
        document.documentElement.style.setProperty('--app-font-size', fontSizeMap[textSize]);
      },
      setFontStyle: (fontStyle) => {
        set({ fontStyle });
        document.documentElement.style.setProperty('--app-font-family', fontFamilyMap[fontStyle]);
      },
      setLanguage: (language) => set({ language }),
      setReducedMotion: (reducedMotion) => {
        set({ reducedMotion });
        document.documentElement.setAttribute('data-reduce-motion', String(reducedMotion));
      },
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
      setSosMode: (sosMode) => set({ sosMode }),
      setEmergencyContact: (emergencyContact) => set({ emergencyContact }),
      setColorScheme: (colorScheme) => {
        set({ colorScheme });
        document.documentElement.setAttribute('data-color-scheme', colorScheme);
      },
      setShowTutorial: (showTutorial) => set({ showTutorial }),
    }),
    {
      name: 'roadsos-settings-v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-apply settings on load
          document.documentElement.setAttribute('data-theme', state.theme);
          document.documentElement.style.setProperty('--app-font-size', fontSizeMap[state.textSize]);
          document.documentElement.style.setProperty('--app-font-family', fontFamilyMap[state.fontStyle]);
          document.documentElement.setAttribute('data-reduce-motion', String(state.reducedMotion));
          document.documentElement.setAttribute('data-color-scheme', state.colorScheme);
        }
      }
    }
  )
);
