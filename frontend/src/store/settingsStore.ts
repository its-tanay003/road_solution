import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark-hud' | 'dark-soft' | 'high-contrast' | 'light-clean';
export type TextSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl';
export type FontStyle = 'inter' | 'rajdhani' | 'atkinson';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';
export type SosMode = 'hold3s' | 'tap3x' | 'voice' | 'shake';
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
  bloodGroup: string;
  allergies: string[];

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
  setBloodGroup: (v: string) => void;
  setAllergies: (v: string[]) => void;
}

const FONT_SIZE_MAP: Record<TextSize, string> = {
  small: '13px',
  medium: '15px',
  large: '18px',
  xl: '22px',
  xxl: '26px',
};

const FONT_FAMILY_MAP: Record<FontStyle, string> = {
  inter: "'Inter', sans-serif",
  rajdhani: "'Rajdhani', sans-serif",
  atkinson: "'Atkinson Hyperlegible', sans-serif",
};

// Apply settings to DOM — called on every change and on rehydration
export const applySettingsToDOM = (state: Partial<SettingsState>) => {
  const root = document.documentElement;

  if (state.theme) {
    root.setAttribute('data-theme', state.theme);
    // Remove all theme classes first, then add the active one
    root.classList.remove('theme-dark-hud', 'theme-dark-soft', 'theme-high-contrast', 'theme-light-clean');
    root.classList.add(`theme-${state.theme}`);
  }

  if (state.textSize) {
    root.style.setProperty('--app-font-size', FONT_SIZE_MAP[state.textSize]);
  }

  if (state.fontStyle) {
    root.style.setProperty('--app-font-family', FONT_FAMILY_MAP[state.fontStyle]);
  }

  if (state.reducedMotion !== undefined) {
    root.classList.toggle('reduce-motion', state.reducedMotion);
    root.setAttribute('data-reduce-motion', String(state.reducedMotion));
  }

  if (state.colorScheme) {
    root.setAttribute('data-color-scheme', state.colorScheme);
  }
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
      bloodGroup: '',
      allergies: [],

      setTheme: (theme) => {
        set({ theme });
        applySettingsToDOM({ theme });
      },
      setTextSize: (textSize) => {
        set({ textSize });
        applySettingsToDOM({ textSize });
      },
      setFontStyle: (fontStyle) => {
        set({ fontStyle });
        applySettingsToDOM({ fontStyle });
      },
      setLanguage: (language) => set({ language }),
      setReducedMotion: (reducedMotion) => {
        set({ reducedMotion });
        applySettingsToDOM({ reducedMotion });
      },
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
      setSosMode: (sosMode) => set({ sosMode }),
      setEmergencyContact: (emergencyContact) => set({ emergencyContact }),
      setColorScheme: (colorScheme) => {
        set({ colorScheme });
        applySettingsToDOM({ colorScheme });
      },
      setShowTutorial: (showTutorial) => set({ showTutorial }),
      setBloodGroup: (bloodGroup) => set({ bloodGroup }),
      setAllergies: (allergies) => set({ allergies }),
    }),
    {
      name: 'roadsos-settings-v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-apply ALL stored settings to DOM on every page load
          applySettingsToDOM({
            theme: state.theme,
            textSize: state.textSize,
            fontStyle: state.fontStyle,
            reducedMotion: state.reducedMotion,
            colorScheme: state.colorScheme,
          });
        }
      },
    }
  )
);
