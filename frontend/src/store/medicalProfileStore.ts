import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encryptData } from '../utils/crypto';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface MedicalProfileState {
  name: string;
  age: string;
  bloodType: string;
  conditions: string[];
  contacts: EmergencyContact[];
  language: 'en' | 'hi' | 'ta';
  onboardingComplete: boolean;
  
  setName: (name: string) => void;
  setAge: (age: string) => void;
  setBloodType: (type: string) => void;
  setConditions: (conditions: string[]) => void;
  setContacts: (contacts: EmergencyContact[]) => void;
  setLanguage: (lang: 'en' | 'hi' | 'ta') => void;
  setOnboardingComplete: (val: boolean) => void;
  
  // Encryption wrapper
  getEncryptedPayload: () => Promise<{ cipherText: string, iv: string }>;
}

export const useMedicalProfileStore = create<MedicalProfileState>()(
  persist(
    (set, get) => ({
      name: '',
      age: '',
      bloodType: '',
      conditions: [],
      contacts: [],
      language: 'en',
      onboardingComplete: false,

      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
      setBloodType: (bloodType) => set({ bloodType }),
      setConditions: (conditions) => set({ conditions }),
      setContacts: (contacts) => set({ contacts }),
      setLanguage: (language) => set({ language }),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),

      getEncryptedPayload: async () => {
        const { name, age, bloodType, conditions, contacts } = get();
        const payload = { name, age, bloodType, conditions, contacts };
        return await encryptData(payload);
      }
    }),
    {
      name: 'roadsos-medical-profile',
    }
  )
);
